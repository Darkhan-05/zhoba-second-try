import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    studentName: string;
    hatColor: string;
    content: string;
    roomCode: string;
  }) {
    const session = await this.prisma.session.findUnique({
      where: { roomCode: data.roomCode },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.answer.create({
      data: {
        studentName: data.studentName,
        hatColor: data.hatColor,
        content: data.content,
        sessionId: session.id,
      },
    });
  }
}
