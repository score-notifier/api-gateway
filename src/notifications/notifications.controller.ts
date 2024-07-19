import { Controller, Inject, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { catchError } from 'rxjs';

@Controller('notifications')
export class NotificationsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get(':userId')
  getUserNotifications(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.client.send('notification.get.all', { userId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
