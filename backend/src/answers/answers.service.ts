import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.answer.findMany()
  }

  async create(data: {
    studentName: string;
    hatColor: string;
    content: string;
    questionId: string;
    roomCode: string;
  }) {
    const session = await this.prisma.session.findUnique({
      where: { roomCode: data.roomCode },
    });

    if (!session) {
      throw new NotFoundException('Сессия не найдена');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: data.questionId }
    });

    if (!question) {
      throw new NotFoundException('Вопрос не найден');
    }

    return this.prisma.answer.create({
      data: {
        studentName: data.studentName,
        hatColor: data.hatColor,
        content: data.content,
        sessionId: session.id,
        questionId: data.questionId,
      },
    });
  }
}