import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { catchError } from 'rxjs';
import { CreateUserProfileDto, CreateSubscriptionDto } from './dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

import { CACHE_DURATION } from '../common';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Post('register')
  registerUser(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.client.send('user.register.profile', createUserProfileDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('subscribe')
  createSubscription(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.client.send('user.subscribe.team', createSubscriptionDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  // Should be one hour, but I'd have to implement the cache invalidation
  // I will implement it later if I have time.
  @CacheTTL(CACHE_DURATION.ONE_MINUTE)
  getUsers() {
    return this.client.send('user.get.all', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':userId/subscriptions')
  // Should be one day, but I'd have to implement the cache invalidation
  // I will implement it later if I have time.
  @CacheTTL(CACHE_DURATION.ONE_MINUTE)
  getUserSubscriptions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.client.send('user.get.subscriptions', { userId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
