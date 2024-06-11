import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');
// Protected to route
@Injectable()
export class JwtWsAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext): boolean {
    let { token } = context.switchToWs().getClient().handshake.auth;
    token = token.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    const decoded = jwt.verify(token, this.configService.get('JWT_SECRET_KEY')); // Replace with your secret key
    if (decoded) {
      return true;
    }
    return false;
  }
}
