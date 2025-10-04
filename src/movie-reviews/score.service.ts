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
    return this.datasource.transaction(async (entityManager) => {  //รวมคำสั่งให้เป็นหน่วยเดียวกันสำเร็จถึงจะ commit
      const scoreRepository = entityManager.getRepository(Score);
      const movieReviewsRepository = entityManager.getRepository(MovieReviews);

      // upsert rating
      const keys = {
        movieReview: {id :movieReviewsId },    // คะแนนที่จะถูกบันทึก เป็นของ id movie และผู้ใช้
        user: { username: loggedInDto.username },
      };
      await scoreRepository
        .upsert(
          { score: scoreDto.score, ...keys }, //คะแนนที่จะให้
          { conflictPaths: ['movieReview', 'user'] },  //หา moviereview และ user เพื่อ insert หรือ update
        )
        .catch(() => {
          throw new NotFoundException(`Not found: id=${movieReviewsId }`); //หากไม่เจอ
        });

      // query last avg & count
      const { avg, count } = await scoreRepository
        .createQueryBuilder('score') //สร้างตารางขึ้นมา
        .select('AVG(score.score)', 'avg')
        .addSelect('COUNT(score.id)', 'count')
        .where('score.movie_reviews_id = :movieReviewsId', { movieReviewsId })  //ให้คำนวนเฉพาะที่มี movieid เดียวกัน
        .getRawOne(); //ดึงมาแค่ค่าเฉลี่ยและนับ

      // update 
      await movieReviewsRepository.update(movieReviewsId, {
        avgScore: parseFloat(avg),
        scoreCount: parseInt(count, 10),
      });

      return movieReviewsRepository.findOneBy({ id: movieReviewsId });  //ส่งคืนกลับหา moviereview ตาม id
    });
  }
}

