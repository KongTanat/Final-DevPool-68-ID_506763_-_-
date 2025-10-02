import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoggedInDto } from '../dto/logged-in.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Strategy จะไปค้นหา Token ใน Authorization Header ในรูปแบบ Bearer <token>
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  validate(user: LoggedInDto): LoggedInDto {
    // not special validate just jwt
    return user;
  }
}
