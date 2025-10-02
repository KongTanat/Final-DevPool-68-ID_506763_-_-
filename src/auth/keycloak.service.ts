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
  private config: client.Configuration;

  constructor(
    private keycloakConfig: KeycloakConfig,
    private usersService: UsersService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) { }

  async getConfig() {

    if (this.config) {
      return this.config;
    }

    const server = new URL(this.keycloakConfig.issuer);
    const clientId = this.keycloakConfig.clientId;
    const clientSecret = this.keycloakConfig.clientSecret;

    this.config = await client.discovery(server, clientId, clientSecret);

    return this.config;
  }

  async getRedirectLoginUrl(): Promise<KeycloakParamsDto> {

    const redirectUri = this.keycloakConfig.callbackUrl;
    const scope = this.keycloakConfig.scope;

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

    const state = client.randomState();
    const parameters: Record<string, string> = {
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
      url: decodeURIComponent(redirectTo.href),
    };
  }

  async login(
    keycloakParamDto: KeycloakParamsDto,
  ): Promise<{ idToken: string; tokensDto: TokensDto }> {
    console.log('keycloakParamDto', keycloakParamDto);

    // get idToken & keycloakPayload
    const { idToken, keycloakPayload } = await this.authorizationByCode(keycloakParamDto);
    console.log(`[KeycloakService] Received payload for user: ${keycloakPayload.preferred_username}`);

    // upsert user by keycloak id
    const user: User = await this.usersService.upsertByKeycloakId(
      keycloakPayload.preferred_username,
      keycloakPayload.sub,
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

  private async authorizationByCode(
    keycloakParamDto: KeycloakParamsDto,
  ): Promise<{ idToken: string; keycloakPayload: KeycloakPayload }> {
    // verify code that send from front-end by pkceCodeVerifier & state
    const tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant(
      await this.getConfig(),
      new URL(`${this.keycloakConfig.callbackUrl}?${keycloakParamDto.url}`),
      {
        pkceCodeVerifier: keycloakParamDto.codeVerifier,
        expectedState: keycloakParamDto.state,
      },
    )!;

    // check id_toke
    if (!tokens.id_token) {
      throw new UnauthorizedException(`tokens.id_token should not blank`);
    }

    // return idToken & keycloakPayload
    const idToken = tokens.id_token;
    const keycloakPayload = await this.jwtService.decode(idToken);

    return { idToken, keycloakPayload: keycloakPayload };

  }

  async logout(idToken: string): Promise<string> {
    const logoutUrl = client.buildEndSessionUrl(await this.getConfig(), {
      id_token_hint: idToken,
      post_logout_redirect_uri: this.keycloakConfig.postLogoutRedirectUri,
    });

    return logoutUrl.href;
  }

}
