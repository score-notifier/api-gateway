import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController],
  imports: [NatsModule],
})
export class StatsModule {}
