// refresh-jwt.strategy.ts ดึง token จาก cookie
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoggedInDto } from '../dto/logged-in.dto';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.refreshToken || '',  //ดึงค่าจาก token
      ]),
      secretOrKey: `${process.env.REFRESH_JWT_SECRET}`,
    });
  }

  validate(user: LoggedInDto): LoggedInDto {      //อาจต้องเพิ่มการ revoked  เพื่อใช้การ logout (ค่อยทำ)
    return { username: user.username, role: user.role };
  }

}
