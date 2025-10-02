import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RatingModule } from './rating/rating.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOpts } from './data-source';
import { UsersModule } from './users/users.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './auth/auth.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { MovieReviewsModule } from './movie-reviews/movie-reviews.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory:() => ({
        ...dataSourceOpts,
        autoLoadEntities:true,
        synchronize:true,
      }),
    }),
    ConfigifyModule.forRootAsync()
    ,RatingModule,  UsersModule, AuthModule, MovieReviewsModule],
  controllers: [AppController],
  providers: [
    {
      provide : APP_PIPE,
      useClass : ZodValidationPipe  //เรียก zod มา validation
    }
    ,AppService],


})
export class AppModule {}
