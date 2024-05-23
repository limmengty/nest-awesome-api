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

@WebSocketGateway({ cors: true })
export class ChatGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(ChatGateWay.name);
  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('WebSocket Initilaized');
  }
  handleConnection(client) {
    this.logger.log(`ClientId: ${client.id} Connected`);
    this.logger.log(`JWT Token: ${client.handshake.auth.token}`);
  }
  handleDisconnect(client) {
    this.logger.log(`ClientId: ${client.id} Disconnect`);
  }

  @UseInterceptors(new TimeoutInterceptor())
  @UseInterceptors(new LoggingInterceptor())
  @UseGuards(JwtWsAuthGuard)
  @SubscribeMessage('send-message')
  handleMessage(client: any, data: any) {
    this.logger.log(`client id: ${client.id} connected`);
    this.logger.log(data);
    this.io.emit('re-message', data);
  }
}
