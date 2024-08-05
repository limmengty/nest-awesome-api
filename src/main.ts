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
// import { RedisIoAdapter } from './modules/common/adapter/ws.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
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
