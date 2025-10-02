import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieReviewDto, createMovieReviewsSchema } from './create-movie-review.dto';
import { createZodDto } from 'nestjs-zod';

const updateMovieReviewDtoSchema = createMovieReviewsSchema.partial();

export class UpdateMovieReviewDto extends createZodDto(
    updateMovieReviewDtoSchema,
) {}
