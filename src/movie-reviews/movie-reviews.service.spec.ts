import { Test, TestingModule } from '@nestjs/testing';
import { MovieReviewsService } from './movie-reviews.service';

describe('MovieReviewsService', () => {
  let service: MovieReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieReviewsService],
    }).compile();

    service = module.get<MovieReviewsService>(MovieReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
