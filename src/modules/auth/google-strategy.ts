import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK'),
      scope: ['email', 'profile', ''],
    }); // parent class passport
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      provider: 'google',
      token: _accessToken,
      id: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      firstname: name.givenName,
      lastname: name.familyName,
      picture: photos[0].value,
    };

    console.log(_accessToken);
    done(null, user);
  }
}

// note: បើមាន Googlestrategy ត្រូវមាន Guard
