import { Module } from '@nestjs/common';
import { HealthCheckModule } from './health-check/health-check.module';
import { NatsModule } from './transports/nats.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    HealthCheckModule,
    NatsModule,
    UsersModule,
    NotificationsModule,
    CompetitionsModule,
    StatsModule,
  ],
})
export class AppModule {}
