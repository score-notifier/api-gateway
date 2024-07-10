import { Controller, Post, Body, Inject } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { catchError } from 'rxjs';
import { CreateUserProfileDto, CreateSubscriptionDto } from './dto';

@Controller('users')
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
}
