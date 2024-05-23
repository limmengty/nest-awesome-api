import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import jwt = require('jsonwebtoken');
import { ConfigService } from '@nestjs/config';
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
    console.log(token);
    token = token.replace('Bearer ', '');

    const decoded = jwt.verify(token, this.configService.get('JWT_SECRET_KEY'));

    console.log(decoded);
    // Logic, validate JWT
    return true;
  }
}
