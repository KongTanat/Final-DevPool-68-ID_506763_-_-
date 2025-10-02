import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieReviewDto } from './dto/create-movie-review.dto';
import { UpdateMovieReviewDto } from './dto/update-movie-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieReviews } from './entities/movie-review.entity';
import { Repository } from 'typeorm';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { PaginateQuery, PaginateConfig, paginate } from 'nestjs-paginate';

const paginateConfig: PaginateConfig<MovieReviews> = {
  sortableColumns: ['id', 'name', 'avgScore', 'scoreCount'],
  searchableColumns: ['name', 'rating'],
};

@Injectable()
export class MovieReviewsService {
  constructor(@InjectRepository(MovieReviews) private repository: Repository<MovieReviews>,
  ) { }

  private queryTemplate() {
    return this.repository
      .createQueryBuilder('movie_reviews')
      .leftJoinAndSelect('movie_reviews.rating', 'rating')
      .leftJoin('movie_reviews.user', 'user')
      .addSelect('user.id')
      .addSelect('user.username')
      .addSelect('user.role');
  }


  create(createMovieReviewDto: CreateMovieReviewDto, loggedInDto: LoggedInDto) {
    return this.repository.save({
      ...createMovieReviewDto,
      user: { username: loggedInDto.username }
    });
  }

  async search(query: PaginateQuery) {
    const page = await paginate<MovieReviews>(
      query,
      this.queryTemplate(),
      paginateConfig,
    )
    return {
      data: page.data,
      meta: page.meta
    };
  }

  findOne(id: number) {
    return this.queryTemplate().where('movie_reviews.id = :id', { id }).getOne();
  }

  async update(
    id: number,
    updateMovieReviewDto: UpdateMovieReviewDto,
    loggedInDto: LoggedInDto) {
    return this.repository
      .findOneByOrFail({ id, user: { username: loggedInDto.username } })
      .then(() => this.repository.save({ id, ...updateMovieReviewDto }))
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`)
      })
  };

  async remove(id: number, loggedInDto: LoggedInDto) {
    return this.repository
      .findOneByOrFail({ id, user: { username: loggedInDto.username } })
      .then(() => this.repository.delete({ id }))
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`);
      });
  }
}
