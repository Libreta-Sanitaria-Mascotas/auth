import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as RedisStore from 'cache-manager-ioredis';
import { envs } from './config';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: async () => {
        const { db } = envs;
        return {
          ...db,
          entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
    }),
      CacheModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: async () => {
        const { redis } = envs;
        return {
          ...redis,
          store: RedisStore,
          ttl: 0
        };
      },
      isGlobal: true
    }),
  
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
