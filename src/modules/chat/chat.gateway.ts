import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { JwtWsAuthGuard } from '../common/guard/jwt-ws.guard';
import { LoggingInterceptor } from '../common/interceptor/logging.interceptor';
import { TimeoutInterceptor } from '../common/interceptor/timeout.interceptor';
import { ChatEntity } from './entity/chat.entity';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { UUIDType } from '../common/validator/FindOneUUID.validator';

@WebSocketGateway({ cors: true })
export class ChatGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  private logger = new Logger(ChatGateWay.name);
  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('WebSocket Initilaized');
  }
  handleConnection(client: Socket) {
    this.logger.log(`ClientId: ${client.id} Connected`);
    this.logger.log(`JWT Token: ${client.handshake.auth.token}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`ClientId: ${client.id} Disconnect`);
  }

  // @UseInterceptors(new TimeoutInterceptor())
  // @UseInterceptors(new LoggingInterceptor())
  // @UseGuards(JwtWsAuthGuard)
  // @SubscribeMessage('send-message')
  // async handleMessage(client: any, payload: ChatEntity): Promise<void> {
  //   this.logger.log(`client id: ${client.id} connected`);
  //   this.chatService.create(payload);
  //   this.io.emit('re-message', payload);
  //   this.logger.log(payload);
  // }
  @UseInterceptors(new TimeoutInterceptor())
  @UseInterceptors(new LoggingInterceptor())
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('send-message')
  async handleMessage(client: Socket, payload: ChatEntity): Promise<void> {
    await this.chatService.create(payload, client.handshake.auth.id);
    this.io.emit('re-message', payload);
  }
}
