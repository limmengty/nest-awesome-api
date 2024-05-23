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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly httpService: HttpService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createToken(user: UserEntity) {
    return {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
      accessToken: this.jwtService.sign({ id: user.id }),
      user,
    };
  }

  async validateUser(payload: LoginPayload): Promise<UserEntity> {
    const user = await this.userService.getByUsername(payload.username);
    if (!user || !Hash.compare(payload.password, user.password)) {
      throw new UnauthorizedException('Username or Password is not correct!');
    }

    if (user.userType == UsersType.OAUTH) {
      throw new UnauthorizedException('UAuth User not allowed here!');
    }
    return user;
  }

  async registerGoogleUser(code: any): Promise<any> {
    const { data } = await this.httpService.axiosRef.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        code: code,
        redirect_uri: this.configService.get('GOOGLE_CALLBACK'),
        grant_type: 'authorization_code',
      },
    );

    const access_token = data.access_token;
    console.log(access_token);
    const response = await this.httpService.axiosRef.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );
    const user = await this.userRepository.findOne({
      where: { email: response.data.email },
    });

    if (user) {
      return this.createToken(user);
    }

    // create new user
    const newUser = this.userRepository.create({
      name: response.data.name,
      username: response.data.given_name + new Date().getTime(),
      userType: UsersType.OAUTH,
      picture: response.data.picture,
      email: response.data.email,
    });

    this.userRepository.save(newUser);
    return this.createToken(newUser);
  }
}
