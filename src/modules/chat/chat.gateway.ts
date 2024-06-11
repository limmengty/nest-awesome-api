import { Logger, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
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
  //   this.logger.log(`client id: ${client.id}  connected`);
  //   this.chatService.create(payload);
  //   this.io.emit('re-message', payload);
  //   this.logger.log(payload);
  // }
  @UseInterceptors(new TimeoutInterceptor())
  @UseInterceptors(new LoggingInterceptor())
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: any,
    @MessageBody() payload: ChatEntity,
  ): Promise<void> {
    const user = client.data;
    console.log(user);
    await this.chatService.create(payload, user.id);
    this.io.emit('re-message', payload);
  }
}
