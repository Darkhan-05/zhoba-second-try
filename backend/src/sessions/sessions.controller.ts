import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AnalyticsService } from './analytics.service';

export class CreateSessionDto {
  topic: string;
  roomCode: string;
  questions: string[];
}

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly analyticsService: AnalyticsService
  ) { }

  @Get()
  findAll() {
    return this.sessionsService.findAll()
  }

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get(':roomCode')
  async findOne(@Param('roomCode') roomCode: string) {
    const session = await this.sessionsService.findOne(roomCode);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  @Get(':roomCode/analytics')
  async getAnalytics(@Param('roomCode') roomCode: string) {
    const session = await this.sessionsService.findOne(roomCode);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    const answers = await this.sessionsService.getAnswers(roomCode);
    console.log('answers')
    return this.analyticsService.summarizeAnswers(session.topic, answers);
  }
}
