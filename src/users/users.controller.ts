import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordRemoverInterceptor } from '@app/interceptors/password-remover.interceptor';
import { JwtGuard } from '@app/auth/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }



  @UseGuards(AuthGuard('jwt')) // jwt defaultname ใน passsport
  @UseInterceptors(PasswordRemoverInterceptor)
  @Get('me')
  findByUsername(@Req() req: { user: LoggedInDto }) {
    return this.usersService.findByUsername(req.user.username)
  }


}
