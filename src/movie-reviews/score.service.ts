import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ScoreDto } from './dto/score.dto';
import { MovieReviews } from './entities/movie-review.entity';
import { Score } from './entities/score.entity';

@Injectable()
export class ScoreService {
  constructor(private datasource: DataSource) {}

  async score(
    movieReviewsId: number,
    scoreDto: ScoreDto,
    loggedInDto: LoggedInDto,
  ) {
    // create transaction
    return this.datasource.transaction(async (entityManager) => {
      const scoreRepository = entityManager.getRepository(Score);
      const movieReviewsRepository = entityManager.getRepository(MovieReviews);

      // upsert rating
      const keys = {
        movieReview: {id :movieReviewsId },
        user: { username: loggedInDto.username },
      };
      await scoreRepository
        .upsert(
          { score: scoreDto.score, ...keys },
          { conflictPaths: ['movieReview', 'user'] },
        )
        .catch(() => {
          throw new NotFoundException(`Not found: id=${movieReviewsId }`);
        });

      // query last avg & count
      const { avg, count } = await scoreRepository
        .createQueryBuilder('score')
        .select('AVG(score.score)', 'avg')
        .addSelect('COUNT(score.id)', 'count')
        .where('score.movie_reviews_id = :movieReviewsId', { movieReviewsId })
        .getRawOne();

      // update FoodRecipe
      await movieReviewsRepository.update(movieReviewsId, {
        avgScore: parseFloat(avg),
        scoreCount: parseInt(count, 10),
      });

      return movieReviewsRepository.findOneBy({ id: movieReviewsId });
    });
  }
}

