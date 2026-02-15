import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Session } from '@prisma/client';
import { CreateSessionDto } from './sessions.controller';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) { }

  async create(createSessionDto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        topic: createSessionDto.topic,
        roomCode: createSessionDto.roomCode,
        questions: {
          create: createSessionDto.questions.map(q => ({
            content: q
          }))
        }
      },
      include: {
        questions: true
      }
    });
  }

  async findOne(roomCode: string) {
    const session = await this.prisma.session.findUnique({
      where: { roomCode },
      include: {
        questions: true,
        answers: true,
        _count: {
          select: { answers: true }
        }
      }
    });

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findAll() {
    return this.prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { answers: true, questions: true }
        }
      }
    });
  }

  async getAnswers(roomCode: string) {
    return this.prisma.answer.findMany({
      where: {
        session: { roomCode },
      },
    });
  }
}
