import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserEvent {
  private logger = new Logger(UserEvent.name);
  @OnEvent('user.created')
  emailUserVerificationLink(payload: any) {
    this.logger.log('User created event received');
    this.logger.log(payload);
  }
}
