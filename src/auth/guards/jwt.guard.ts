import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()  //ดักจับ bearar โดย true pass false No pass
export class JwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']
    console.log('LoggedInGuard: authHeader', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized (JwtGuard)')
    }

    const token = authHeader.split(' ')[1] as string
    return token.startsWith('VALID_TOKEN')
  }
}
