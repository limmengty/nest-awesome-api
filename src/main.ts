import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './swagger';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { CrudConfigService } from '@nestjsx/crud';

CrudConfigService.load({
  query: {
    limit: 10,
    alwaysPaginate: true,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  routes: {
    updateOneBase: {
      allowParamsOverride: true,
    },
    deleteOneBase: {
      returnDeleted: true,
    },
  },
});
import { AppModule } from './app/app.module';
import { RedisIoAdapter } from './modules/common/adapter/ws.adapter';
// import helmet from 'helmet';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
// import { RedisIoAdapter } from './modules/common/adapter/ws.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  const config: ConfigService = app.get(ConfigService);
  const redisURL =
    config.get('NODE_ENV') == 'dev' || config.get('NODE_ENV') == 'local.prod'
      ? `redis://${config.get('CACHE_HOST')}:${config.get('CACHE_PORT')}`
      : config.get('REDIS_URL');
  await redisIoAdapter.connectToRedis(redisURL, config.get('CAHCE_PASSWORD'));
  app.use(helmet());
  setupSwagger(app);
  // Enable Cors for development
  app.enableCors();
  // Global Pipe to intercept request and format data accordingly
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Listen to port given by environment on production server (Heroku, DigitalOcean App,..), otherwise 3000
  // Specify '0.0.0.0' in the listen() to accept connections on other hosts.
  // app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
