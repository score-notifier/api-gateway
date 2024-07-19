import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { CompetitionsController } from './competitions.controller';

@Module({
  controllers: [CompetitionsController],
  imports: [NatsModule],
})
export class CompetitionsModule {}
