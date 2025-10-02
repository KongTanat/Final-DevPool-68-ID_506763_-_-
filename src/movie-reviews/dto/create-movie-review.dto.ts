import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';


export const createMovieReviewsSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    year: z.string().min(1, 'ingredient is required'),
    description: z.string().min(1, 'description is required'),
    rating: z.object({
      id: z
        .number()
        .int()
        .min(1, 'cookingDuration.id must be a number between 1 - 6')
        .max(6, 'cookingDuration.id must be a number between 1 - 6'),
    }),
  })
  .strict();
export class CreateMovieReviewDto {}
