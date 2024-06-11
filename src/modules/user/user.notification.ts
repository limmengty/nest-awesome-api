import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserNotification {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private readonly logger = new Logger(UserNotification.name);

  //   @Cron('10 * * * * *')
  @Cron(CronExpression.EVERY_12_HOURS)
  async informUser() {
    const users = await this.userRepository.find({ select: ['email', 'id'] });
    this.logger.log('Printing');
    users.forEach((user) => {
      this.logger.log(user.email);
    });
  }
}
