import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Hash } from '../../utils/Hash';
import { UserEntity, UsersService } from '../user';
import { LoginPayload } from './payloads/login.payload';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersType } from '../common/enum/user_type.enum';
import { ProviderEnum } from '../common/enum/provider.enum';
import { IntegrationEntity } from '../user/entity/integration.entity';
import { AuthCallbackPayload } from './payloads/AuthCallback.payload';

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
  ) {}

  async createToken(user: UserEntity) {
    return {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      accessToken: this.jwtService.sign({ id: user.id }),
      // user,
    };
  }

  async getTokens(userId: string) {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
        },
      ),
    ]);
    return {
      accessToken: accessToken,
      // refreshToken: refreshToken,
    };
  }
  async validateUser(payload: LoginPayload): Promise<UserEntity> {
    const user = await this.userService.getByUsername(payload.username);
    if (!user || !Hash.compare(payload.password, user.password)) {
      throw new UnauthorizedException('Username or Password is not correct!');
    }

    if (user.registrationType == UsersType.OAUTH) {
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

  async handleAuthCallback(req, provider: ProviderEnum) {
    const user = req.user;
    const exUser = await this.userService.getByEmail(user.email);
    // const createToken = async () => {
    //   const tokens = await this.getTokens(exUser.id);
    //   return tokens;
    // };

    if (exUser) {
      const integration = await this.userService.getIntegrationById(exUser.id);

      if (integration.some((obj) => obj.provider === provider)) {
        return await this.createToken(exUser);
      }

      await this.integrationRepository.save({
        byUser: exUser.id,
        provider: provider,
        integrationId: user.id,
      });

      // await this.markEmailAsConfirmed(user.email);
      return await this.createToken(exUser);
    }

    const payload: AuthCallbackPayload = {
      email: user.email,
      username: user.username,
    };

    const newUser = await this.userService.saveUser(
      payload,
      UsersType.OAUTH,
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
    return tokens;
  }
}
