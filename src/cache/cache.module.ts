import { Logger, Module } from '@nestjs/common';
import {
  CacheInterceptor,
  CacheModule as NestCacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
import { createClient } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { envs } from '../config';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    NestCacheModule.registerAsync<RedisClientOptions>({
      useFactory: async () => {
        const logger = new Logger('CacheModule');

        const client = createClient({
          socket: {
            host: envs.redisHost,
            port: envs.redisPort,
          },
        });
        await client.connect();

        const store = (await redisStore({
          ttl: envs.redisCacheTTL,
          socket: client.options.socket,
        })) as unknown as CacheStore;

        logger.log('Connected to Redis');

        return {
          store,
        };
      },
      isGlobal: true,
    }),
  ],
  exports: [NestCacheModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class CacheModule {}
