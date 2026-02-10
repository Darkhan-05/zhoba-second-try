import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [PrismaModule, SessionsModule, AnswersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
