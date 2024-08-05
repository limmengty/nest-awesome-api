import { ConfigService } from '@nestjs/config';
import { MailmanOptions } from '@squareboat/nest-mailman';
const appRoot = require('app-root-path');

export async function mailMainConfig(configService: ConfigService) {
  return {
    host: configService.get('EMAIL_HOST'),
    port: +configService.get('EMAIL_PORT'),
    username: configService.get('EMAIL_USER'),
    password: configService.get('EMAIL_PASSWORD'),
    from: configService.get('MAIL_SENDER_ID'),
    path: appRoot + '/src/templates',
  } as MailmanOptions;
}
