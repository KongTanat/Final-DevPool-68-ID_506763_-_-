import { Test, TestingModule } from '@nestjs/testing';
import { MovieReviewsController } from './movie-reviews.controller';
import { MovieReviewsService } from './movie-reviews.service';

describe('MovieReviewsController', () => {
  let controller: MovieReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieReviewsController],
      providers: [MovieReviewsService],
    }).compile();

    controller = module.get<MovieReviewsController>(MovieReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
