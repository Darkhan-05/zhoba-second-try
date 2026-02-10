import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, AnalyticsService],
  exports: [SessionsService]
})
export class SessionsModule {}
