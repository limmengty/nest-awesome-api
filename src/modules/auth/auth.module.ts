import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity, UserModule } from '../user';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleStrategy } from '../common/strategy/google-strategy';
import { IntegrationEntity } from '../user/entity/integration.entity';
import { RefreshTokenStrategy } from '../common/strategy/refresh-token.strategy';
import { GithubStrategy } from '../common/strategy/github.strategy';
import { ChatEntity } from '../chat/entity/chat.entity';

@Module({
  imports: [
    UserModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, IntegrationEntity, ChatEntity]),
    JwtModule.register({}),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     return {
    //       secret: configService.get<string>('JWT_SECRET_KEY'),
    //       signOptions: {
    //         ...(configService.get<string>('JWT_EXPIRATION_TIME')
    //           ? {
    //               expiresIn: Number(configService.get('JWT_EXPIRATION_TIME')),
    //             }
    //           : {}),
    //       },
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    RefreshTokenStrategy,
    GithubStrategy,
  ],
  // exports: [PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule {}
