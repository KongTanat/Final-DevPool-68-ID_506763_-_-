import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RatingService } from './rating.service';


@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {
    
  }



  @Get()
  findAll() {
    return this.ratingService.findAll();
  }

  
}
