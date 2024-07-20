import { Controller, Inject, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { catchError } from 'rxjs';
import { CacheTTL } from '@nestjs/cache-manager';
import { CACHE_DURATION } from '../common';

@Controller('notifications')
export class NotificationsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get(':userId')
  @CacheTTL(CACHE_DURATION.ONE_MINUTE)
  getUserNotifications(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.client.send('notification.get.all', { userId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
