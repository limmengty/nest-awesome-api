import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserController } from './user.controller';
// import { PassportModule } from '@nestjs/passport';
import { UsersService } from './user.service';
import { UserGateWay } from './user.getway';
import { IntegrationEntity } from './entity/integration.entity';
import { JwtModule } from '@nestjs/jwt';
import { ChatEntity } from '../chat/entity/chat.entity';
import { UserNotification } from './user.notification';
import { UserEvent } from './user.event';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, IntegrationEntity, ChatEntity]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService, UserGateWay, UserNotification, UserEvent],
})
export class UserModule {}
