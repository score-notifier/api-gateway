import { Module } from '@nestjs/common';
import { HealthCheckModule } from './health-check/health-check.module';
import { NatsModule } from './transports/nats.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HealthCheckModule, NatsModule, UsersModule],
})
export class AppModule {}
