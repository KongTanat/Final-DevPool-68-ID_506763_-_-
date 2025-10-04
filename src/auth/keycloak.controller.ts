// keycloak.controller.ts
import { Controller, Get, Res,Req } from '@nestjs/common';
import type { Response ,Request} from 'express';
import { KeycloakService } from './keycloak.service';

@Controller('keycloak')
export class KeycloakController {

  constructor(private keycloakService: KeycloakService) {}

  @Get('redirect-to-login')
  async redirectToLogin(
    @Res({passthrough:true}) res: Response
  ) {

    const { state, codeVerifier, url } =
      await this.keycloakService.getRedirectLoginUrl()

    res.cookie('state', state) 
    res.cookie('codeVerifier', codeVerifier) 
    
    
    return {url} ; // สร้าง url สำหรับหน้า login ของ keycloak ที่เป็น object
  }

  @Get('login')  
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const state = req.cookies?.state;     // ดึงค่า state และ codeverifier ผ่าน cookie
    const codeVerifier = req.cookies?.codeVerifier;
    const url = req.originalUrl.split('?')[1] || ''; //split url  ? ตัวแบ่ง ใส่ or เพื่อป้องกัน  url ไม่มี ?
    

    const { idToken, tokensDto } = await this.keycloakService.login({
      state,
      codeVerifier,
      url,
    });    // auth  ผ่าน keycloak server เพื่อขอ idtoken , tokensDto

    res.cookie('idToken', idToken)   // ตั้งค่า cookie ใหม่
    res.cookie('refreshToken', tokensDto.refreshToken)

    res.clearCookie('state') // ล้าง cookig ชั่วคราวหลังขอ acresstoken
    res.clearCookie('codeVerifier')

    return { accessToken: tokensDto.accessToken };
  }
}


