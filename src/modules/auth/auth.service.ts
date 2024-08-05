import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Hash } from '../../utils/Hash';
import { UserEntity, UsersService } from '../user';
import { LoginPayload } from './payloads/login.payload';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersTypeEnum } from '../common/enum/user_type.enum';
import { ProviderEnum } from '../common/enum/provider.enum';
import { IntegrationEntity } from '../user/entity/integration.entity';
import { AuthCallbackPayload } from './payloads/auth-callback.payload';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterEmailPayload } from './payloads/register-email.payload';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(IntegrationEntity)
    private readonly integrationRepository: Repository<IntegrationEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  // async createToken(user: UserEntity) {
  //   return {
  //     expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
  //     accessToken: this.jwtService.sign({ id: user.id }),
  //     // user,
  //   };
  // }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashRefreshToken = Hash.make(refreshToken);
    await this.userRepository.update(userId, {
      refreshToken: hashRefreshToken,
    });
  }

  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
        },
      ),
    ]);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
  async validateUser(payload: LoginPayload): Promise<UserEntity> {
    const user = await this.userService.getByUsername(payload.username);
    if (!user || !Hash.compare(payload.password, user.password)) {
      throw new UnauthorizedException('Username or Password is not correct!');
    }

    if (user.registrationType == UsersTypeEnum.SSO) {
      throw new UnauthorizedException('UAuth User not allowed here!');
    }
    return user;
  }

  // async registerGoogleUser(code: any): Promise<any> {
  //   const { data } = await this.httpService.axiosRef.post(
  //     'https://oauth2.googleapis.com/token',
  //     {
  //       client_id: this.configService.get('GOOGLE_CLIENT_ID'),
  //       client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
  //       code: code,
  //       redirect_uri: this.configService.get('GOOGLE_CALLBACK'),
  //       grant_type: 'authorization_code',
  //     },
  //   );

  //   const access_token = data.access_token;
  //   const response = await this.httpService.axiosRef.get(
  //     'https://www.googleapis.com/oauth2/v2/userinfo',
  //     {
  //       headers: {
  //         Authorization: `Bearer ${access_token}`,
  //       },
  //     },
  //   );
  //   const user = await this.userRepository.findOne({
  //     where: { email: response.data.email },
  //   });

  //   if (user) {
  //     return this.createToken(user);
  //   }

  //   // create new user
  //   const newUser = this.userRepository.create({
  //     name: response.data.name,
  //     username: response.data.given_name + new Date().getTime(),
  //     userType: UsersType.OAUTH,
  //     picture: response.data.picture,
  //     email: response.data.email,
  //   });

  //   this.userRepository.save(newUser);
  //   return this.createToken(newUser);
  // }

  async handleAuthCallback(
    req,
    provider: ProviderEnum,
    usernameField = 'username',
  ) {
    const user = req.user;
    const exUser = await this.userService.getByEmail(user.email);

    const createToken = async () => {
      const tokens = await this.getTokens(exUser.id);
      await this.updateRefreshToken(exUser.id, tokens.refreshToken);
      return tokens;
    };

    if (exUser) {
      const integration = await this.userService.getIntegrationById(exUser.id);

      if (integration.some((obj) => obj.provider === provider)) {
        return await createToken();
      }

      await this.integrationRepository.save({
        byUser: exUser.id,
        provider: provider,
        integrationId: user.id,
      });

      // await this.markEmailAsConfirmed(user.email);
      return await createToken();
    }

    const payload: AuthCallbackPayload = {
      email: user.email,
      firstname: user[usernameField],
      lastname: ' ',
      username: user.firstname + user.lastname,
    };

    const newUser = await this.userService.saveUser(
      payload,
      UsersTypeEnum.SSO,
      user.picture,
    );

    await this.integrationRepository.save(
      this.integrationRepository.create({
        byUser: newUser.id,
        provider: provider,
        integrationId: user.id,
      }),
    );

    const tokens = await this.getTokens(newUser.id);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async register(payload: RegisterEmailPayload, i18n: I18nContext) {
    // const users = await this.userRepository.find({
    //   // Apply or where condition
    //   where: [{ email: payload.email }],
    // });
    const email = payload.email;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    if (user) {
      throw new BadRequestException(i18n.t('error.user_already_existed'));
    }
    // const hashedPassword = Hash.make(payload.password);
    const final = await this.userService.saveUser(
      payload,
      UsersTypeEnum.PASSWORD,
      null,
    );
    /**
     * Create and Persist Refresh Token
     */
    const tokens = await this.getTokens(final.id);
    await this.updateRefreshToken(final.id, tokens.refreshToken);
    /**
     * Send Email to User for Confirmation
     */
    this.eventEmitter.emit('user.registered', {
      fullName: final.firstname + ' ' + final.lastname,
      email: final.email,
      lang: i18n.lang,
    });
    return tokens;
  }

  async logout(userId: string) {
    return this.userRepository.update(userId, { refreshToken: null });
  }
}
