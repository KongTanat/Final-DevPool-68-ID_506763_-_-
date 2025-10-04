import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], //ทำให้สามารถ inject repository ได้
  controllers: [UsersController],
  providers: [UsersService],
   exports: [UsersService]
})

export class UsersModule {}
