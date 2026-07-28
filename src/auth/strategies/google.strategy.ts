import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AppConfigService } from '../../config/app-config.service';

export interface GoogleUserPayload {
  email: string;
  nome: string;
  googleId: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: AppConfigService) {
    super({
      clientID: configService.googleClientId || 'nao-configurado',
      clientSecret: configService.googleClientSecret || 'nao-configurado',
      callbackURL: configService.googleCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    const nome = profile.displayName;

    if (!email) {
      done(new Error('Não foi possível obter o e-mail da conta Google.'), false);
      return;
    }

    const usuario: GoogleUserPayload = { email, nome, googleId: profile.id };
    done(null, usuario);
  }
}
