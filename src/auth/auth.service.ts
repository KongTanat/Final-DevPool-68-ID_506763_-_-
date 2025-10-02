import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { TokensDto } from './dto/tokens.dto';
import { UsersService } from '@app/users/users.service';
import bcrypt from 'bcrypt'
import { LoggedInDto } from './dto/logged-in.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import client from 'openid-client'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }



  async login(loginDto: LoginDto): Promise<TokensDto> {
    //find user by username
    const user = await this.usersService.findByUsername(loginDto.username)

    //compare hashpassword
    const matched = await bcrypt.compare(loginDto.password, user.password) //เทียบรหัส
    if (!matched) {
      throw new UnauthorizedException(`wrong password: username ${loginDto.username}`)
    }

    //return token
    const loggedInDTO: LoggedInDto = {
      username: user.username,
      role: user.role
    }
    return this.generateToken(loggedInDTO)

  }
  generateToken(loggedInDTO: LoggedInDto): TokensDto {
    const accessToken = this.jwtService.sign(loggedInDTO)

    //gen refreshtoken
    const refreshTokenOpts: JwtSignOptions = {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: process.env.REFRESH_JWT_EXPIRES_IN
    }

    const refreshToken = this.jwtService.sign(loggedInDTO, refreshTokenOpts)
    return { accessToken, refreshToken }  // คืนเป็น object สะดวกต่อการจัดการเพิ่ม refreshtoken

  }


  refreshToken(loggedInDTO: LoggedInDto): { accessToken: string } { // เอา Refresh Token เก่า (ที่ตรวจสอบแล้ว)เปลี่ยน กับ Access Token ใหม่ให้แก่ผู้ใช้
    console.log('loggedInDto', loggedInDTO)
    const accessToken = this.jwtService.sign(loggedInDTO)
    return { accessToken }
  }




}

