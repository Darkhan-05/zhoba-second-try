import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Session } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(topic: string, roomCode: string): Promise<Session> {
    return this.prisma.session.create({
      data: {
        topic,
        roomCode,
      },
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
