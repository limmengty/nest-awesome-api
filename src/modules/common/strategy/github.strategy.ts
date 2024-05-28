import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    console.log(configService.get<string>('GITHUB_CLIENT_ID'));
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['public_profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    console.log('profile:' + profile);
    const { id, username, photos } = profile;
    console.log('photo:' + photos[0].value);
    const user = {
      provider: profile.provider,
      id: id,
      username: username,
      email: `${username}@gmail.com`,
      picture: photos[0].value,
    };

    done(null, user);
  }
}
