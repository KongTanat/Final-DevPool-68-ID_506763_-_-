// keycloak.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import client from 'openid-client';
import { KeycloakConfig } from './keycloak.config';
import { KeycloakParamsDto } from './dto/keycloak-params.dto';
import { TokensDto } from './dto/tokens.dto';
import { UsersService } from '@app/users/users.service';
import { AuthService } from './auth.service';
import { User } from '@app/users/entities/user.entity';
import { LoggedInDto } from './dto/logged-in.dto';
import { KeycloakPayload } from './dto/keycloak-payload.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class KeycloakService {
  private config: client.Configuration; //รับและเก็บข้อมูลที่ discovery ออก และไม่ต้องรัน discovery ซ้ำๆ

  constructor(
    private keycloakConfig: KeycloakConfig,
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) { }

  async getConfig() {

    if (this.config) { // config มีค่าอยู่แล้วหรือไม่ (คืนค่าจาก caching) เรียกค่าจาก keyclock server ครั้งเดียว
      return this.config;
    }

    const server = new URL(this.keycloakConfig.issuer);
    const clientId = this.keycloakConfig.clientId;
    const clientSecret = this.keycloakConfig.clientSecret;

    this.config = await client.discovery(server, clientId, clientSecret);  //หาข้อมูลจาก keyclock server  แล้วเก็บไว้ในตัวแปร

    return this.config;
  }

  async getRedirectLoginUrl(): Promise<KeycloakParamsDto> {  //สร้าง url ผู้ใช้ส่งไปยัง keyclock เพื่อ login

    const redirectUri = this.keycloakConfig.callbackUrl;
    const scope = this.keycloakConfig.scope; //อยากได้ข้อมูลอะไรบ้าง

    const codeVerifier = client.randomPKCECodeVerifier(); //string แบบสุ่มเก็บไว้และใช้ภายหลัง
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier); //hash และส่งให้ keyclockserver

    const state = client.randomState(); //สร้าง state แบบสุ่ม
    const parameters: Record<string, string> = {//มี 2 colunm string ทั้ง 2
      redirect_uri: redirectUri, 
      scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    };

    const config = await this.getConfig()
    const redirectTo: URL = client.buildAuthorizationUrl(config, parameters);

    return {
      state,
      codeVerifier,
      url: decodeURIComponent(redirectTo.href), // decode ให้ url สะอาดและอ่านง่าย
    };
  }

    private async authorizationByCode(
    keycloakParamDto: KeycloakParamsDto,
  ): Promise<{ idToken: string; keycloakPayload: KeycloakPayload }> {
    //แลก token จาก getconfig ที่สร้าง
    const tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant( // ร้องของให้ keycloak server สร้าง token (่jwt)
      await this.getConfig(),
      new URL(`${this.keycloakConfig.callbackUrl}?${keycloakParamDto.url}`),  //การรวม url 
      {
        pkceCodeVerifier: keycloakParamDto.codeVerifier,
        expectedState: keycloakParamDto.state,
      },
    )!;  // ! สามารภคืนค่า null ได้มั่นใจจริงว่าจะมีค่าออกมา

    // check id_toke  ยืนยันตัวตน
    if (!tokens.id_token) {
      throw new UnauthorizedException(`tokens.id_token should not blank`);
    }

    // return idToken & keycloakPayload
    const idToken = tokens.id_token;
    const keycloakPayload = await this.jwtService.decode(idToken);

    return { idToken, keycloakPayload: keycloakPayload };

  }


  async login(
    keycloakParamDto: KeycloakParamsDto, // Authorization Code ที่ได้รับมาจาก Keycloak
  ): Promise<{ idToken: string; tokensDto: TokensDto }> {
    console.log('keycloakParamDto', keycloakParamDto);

    // get idToken & keycloakPayload
    const { idToken, keycloakPayload } = await this.authorizationByCode(keycloakParamDto);  //ได้รับ idToken และ keycloakPayload จาก keyclockservice
    console.log(`[KeycloakService] Received payload for user: ${keycloakPayload.preferred_username}`); //ข้อมูลผู้ใช้

    // upsert user by keycloak id
    const user: User = await this.usersService.upsertByKeycloakId(  //insert or update
      keycloakPayload.preferred_username,
      keycloakPayload.sub, // keyclockid
    );
    console.log(`[KeycloakService] User upserted successfully. User ID: ${user.id}`);

    // prepare loggedInDto
    const loggedInDto: LoggedInDto = {
      username: user.username,
      role: user.role,
    };

    // generateTokens
    const tokensDto = this.authService.generateToken(loggedInDto);
    console.log('--- GENERATED TOKENS ---');
    console.log('Access Token:', tokensDto.accessToken);
    console.log('Refresh Token:', tokensDto.refreshToken);
    console.log('------------------------');

    return { idToken, tokensDto };
  }


  async logout(idToken: string): Promise<string> {
    const logoutUrl = client.buildEndSessionUrl(await this.getConfig(), {
      id_token_hint: idToken,  // บอกว่าผู้ใช้คนไหนออกจากระบบ
      post_logout_redirect_uri: this.keycloakConfig.postLogoutRedirectUri, //ส่งมาหาผู้ใช้หลัก logout
    });

    return logoutUrl.href; //แปลงอ็อบเจกต์ URL ให้เป็น สตริง URL
  }

}
