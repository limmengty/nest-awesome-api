import { CacheModule, CacheModuleOptions, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from '../modules/common/interceptor/timeout.interceptor';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '../modules/common/common.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user';
import { LoggingInterceptor } from '../modules/common/interceptor/logging.interceptor';
import { BookModule } from 'src/modules/books/book.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { NoCacheInterceptor } from 'src/modules/common/interceptor/no-cache.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { JwtAuthGuard } from 'src/modules/common/guard/jwt.guard';
import { RolesGuard } from 'src/modules/common/guard/roles.guard';
import { PurchaseModule } from 'src/modules/purchase/purchase.module';
import { MailmanModule } from '@squareboat/nest-mailman';
import { mailMainConfig } from 'src/modules/common/config';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'local.prod' ? '.env.local.prod' : '.env',
    }),
    // ConfigModule.forRoot({
    //   ignoreEnvFile: process.env.NODE_ENV === 'production',
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'development') {
          return {
            type: configService.get<string>('DB_TYPE'),
            host: configService.get<string>('DB_HOST'),
            port: configService.get<string>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [__dirname + './../**/**.entity{.ts,.js}'],
            subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
            migrations: [__dirname + './../**/**/*.migrations.{ts,js}'],
            // synchronize: configService.get<string>('DB_SYNC'),
            synchronize: configService.get<string>('DB_SYNC') !== 'false',
            // synchronize: false,
            retryAttempts: 20,
          } as TypeOrmModuleAsyncOptions;
        }
        if (process.env.NODE_ENV === 'local.prod') {
          const config = {
            type: configService.get<string>('DB_TYPE'),
            host: configService.get<string>('DB_HOST'),
            port: configService.get<string>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [__dirname + './../**/**.entity{.ts,.js}'],
            subscribers: [__dirname + './../**/**/*.subscriber.{ts}'],
            migrations: [__dirname + './../migrations/{*.ts,.js}'],
            synchronize: false,
            migrationsRun: true,
          };
          return config as TypeOrmModuleAsyncOptions;
        }
        if (process.env.NODE_ENV === 'prod') {
          /**
           * Use database url in production instead
           */
          return {
            type: configService.get<string>('DB_TYPE'),
            url: configService.get<string>('DATABASE_URL'),
            entities: [__dirname + './../**/**.entity{.ts,.js}'],
            subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
            // synchronize: configService.get('DB_SYNC'),
            synchronize: false,
            ssl: true,
            retryAttempts: 20,
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          } as TypeOrmModuleAsyncOptions;
        }
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (process.env.NODE_ENV === 'prod') {
          return {
            ttl: config.get<number>('RATE_LIMIT_TTL'),
            limit: config.get<number>('RATE_LIMIT_ITEMS'),
            storage: new ThrottlerStorageRedisService({
              host: config.get<string>('CACHE_HOST'),
              port: config.get<number>('CACHE_PORT'),
              password: config.get<number>('CACHE_PASSWORD'),
              // url: configService.get('REDIS_URL'),
              tls: {
                servername: config.get<string>('CACHE_HOST'),
                rejectUnauthorized: false,
              },
            }),
          };
        }
        return {
          ttl: config.get<number>('RATE_LIMIT_TTL'),
          limit: config.get<number>('RATE_LIMIT_ITEMS'),
          storage: new ThrottlerStorageRedisService({
            host: config.get<string>('CACHE_HOST'),
            port: config.get<number>('CACHE_PORT'),
          }),
        };
      },
    }),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => {
    //     if (process.env.NODE_ENV === 'development') {
    //       return {
    //         ttl: configService.get<string>('CACHE_TTL'), // seconds
    //         max: configService.get<string>('CACHE_MAX'), // maximum number of items in cache
    //         store: redisStore,
    //         host: configService.get<string>('CACHE_HOST'),
    //         port: configService.get<string>('CACHE_PORT'),
    //       };
    //     }
    //     if (process.env.NODE_ENV === 'production') {
    //       /**
    //        * Use redis url in production instead
    //        */
    //       return {
    //         ttl: configService.get<string>('CACHE_TTL'), // seconds
    //         max: configService.get<string>('CACHE_MAX'), // maximum number of items in cache
    //         store: redisStore,
    //         url: configService.get<string>('REDIS_URL'),
    //       };
    //     }
    //   },
    // }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        if (process.env.NODE_ENV === 'prod') {
          return {
            ttl: configService.get('CACHE_TTL'), // seconds
            max: configService.get('CACHE_MAX'), // maximum number of items in cache
            store: redisStore,
            url: configService.get('REDIS_URL'),
            tls: {
              servername: configService.get('CACHE_HOST'),
              rejectUnauthorized: false,
            },
            // isGlobal: true,
          } as CacheModuleOptions;
        }
        return {
          ttl: configService.get<number>('CACHE_TTL'), // seconds
          max: configService.get<number>('CACHE_MAX'), // maximum number of items in cache
          store: redisStore,
          host: configService.get<string>('CACHE_HOST'),
          port: configService.get<number>('CACHE_PORT'),
        } as CacheModuleOptions;
      },
    }),
    MailmanModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mailMainConfig,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'kh',
      loaderOptions: {
        path: join(__dirname, './../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),

    ScheduleModule.forRoot(),
    AuthModule,
    BookModule,
    UserModule,
    PurchaseModule,
    CommonModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    ChatModule,
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: NoCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
