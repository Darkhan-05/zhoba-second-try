import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Session } from '@prisma/client';
import { CreateSessionDto } from './sessions.controller';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) { }

  async create(questions: string[], roomCode: string) {
    return this.prisma.session.create({
      data: {
        roomCode,
        questions: {
          create: questions.map(content => ({ content }))
        }
      },
      include: { questions: true }
    });
  }

  async findOne(roomCode: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { roomCode },
      include: {
        _count: {
          select: { answers: true },
        },
      },
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
