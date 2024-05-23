import { Module } from '@nestjs/common';
import { ChatGateWay } from './chat.gateway';
import { ConfigService } from '@nestjs/config';
@Module({
  providers: [ChatGateWay, ConfigService],
})
export class ChatModule {}
