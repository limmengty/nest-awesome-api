import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserEntity } from './entity/user.entity';
import { UsersService } from './user.service';

@WebSocketGateway({ cors: true })
export class UserGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private userService: UsersService) {}
  private logger = new Logger(UserGateWay.name);
  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('WebSocket Initilaized');
  }
  handleConnection(client) {
    this.logger.log(`ClientId: ${client.id} Connected`);
  }
  handleDisconnect(client) {
    this.logger.log(`ClientId: ${client.id} Disconnect`);
  }

  // updateUserToClient(user: UserEntity) {
  //   this.io.emit('user-updated', user);
  // }e
  @SubscribeMessage('ask-for-user')
  async sendUserToClient(user: UserEntity) {
    const allUser = await this.userService.getAll();
    this.io.emit('user-updated', allUser);
  }
}
