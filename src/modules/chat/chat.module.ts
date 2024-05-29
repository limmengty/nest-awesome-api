import { Module } from '@nestjs/common';
import { ChatGateWay } from './chat.gateway';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatService } from './chat.service';
import { UserEntity } from '../user';
@Module({
  imports: [TypeOrmModule.forFeature([ChatEntity, UserEntity])],
  providers: [ChatGateWay, ConfigService, ChatService],
})
export class ChatModule {}
