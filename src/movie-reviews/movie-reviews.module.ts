import { Module } from '@nestjs/common';
import { MovieReviewsService } from './movie-reviews.service';
import { MovieReviewsController } from './movie-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieReviews } from './entities/movie-review.entity';
import { ScoreService } from './score.service';
import { Score } from './entities/score.entity';

@Module({
  imports : [TypeOrmModule.forFeature([MovieReviews,Score])],
  controllers: [MovieReviewsController],
  providers: [MovieReviewsService, ScoreService],
})
export class MovieReviewsModule {}
