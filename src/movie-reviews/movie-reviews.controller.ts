import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode ,Put} from '@nestjs/common';
import { MovieReviewsService } from './movie-reviews.service';
import { CreateMovieReviewDto } from './dto/create-movie-review.dto';
import { UpdateMovieReviewDto } from './dto/update-movie-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { IdDto } from '@app/common/dto/id.dto';
import { Paginate  } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { ScoreDto } from './dto/score.dto';
import { ScoreService } from './score.service';

@Controller('movie-reviews')
export class MovieReviewsController {
  constructor(private readonly movieReviewsService: MovieReviewsService,
    private scoreService : ScoreService
  ) { }


  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createMovieReviewDto: CreateMovieReviewDto,
    @Req() req: { user: LoggedInDto }) {
    return this.movieReviewsService.create(createMovieReviewDto, req.user);
  }

  @Get()
  search(@Paginate() query:PaginateQuery ) {
    return this.movieReviewsService.search(query);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    return this.movieReviewsService.findOne(idDto.id)
  }


  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param() idDto: IdDto,
    @Body() updateMovieReviewDto: UpdateMovieReviewDto,
    @Req() req: { user: LoggedInDto },
  ) {
    return this.movieReviewsService.update(idDto.id, updateMovieReviewDto, req.user);
  }

  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param() idDto: IdDto,
    @Req() req: { user: LoggedInDto }
  ) {
     this.movieReviewsService.remove(idDto.id, req.user);
  }

    @UseGuards(AuthGuard('jwt'))
  @Put(':id/score')
  rating(
    @Param() idDto: IdDto,
    @Body() scoreDto: ScoreDto,
    @Req() req: { user: LoggedInDto },
  ) {
    return this.scoreService.score(idDto.id, scoreDto, req.user);
  }
}
