import { createZodDto } from 'nestjs-zod';
import z from 'zod';



const scoreDtoSchema = z.object({
  score: z
    .number()
    .int()
    .min(1, 'score must be a number between 1 - 5')
    .max(5, 'score must be a number between 1 - 5'),
});


export class ScoreDto extends createZodDto(scoreDtoSchema) {}
