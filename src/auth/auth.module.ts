import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '@app/users/users.service';
import { UsersModule } from '@app/users/users.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { KeycloakController } from './keycloak.controller';
import { KeycloakService } from './keycloak.service';

@Module({
  imports:[
    JwtModule.registerAsync({
      useFactory:() => {
        const jwtOpts : JwtModuleOptions ={
          secret:process.env.JWT_SECRET,
          signOptions:{
            expiresIn:process.env.JWT_EXPIRES_IN,
          },
        };
        return jwtOpts
      }
    }),UsersModule],
  controllers: [AuthController, KeycloakController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, KeycloakService],
})
export class AuthModule {}
