import { Controller, Post, Body, Get } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @IsNotEmpty()
  @IsString()
  hatColor: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  roomCode: string;

  @IsNotEmpty()
  @IsString()
  questionId: string;
}

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) { }

  @Get()
  async findAll() {
    return this.answersService.findAll();
  }

  @Post()
  async create(@Body() createAnswerDto: CreateAnswerDto) {
    return this.answersService.create(createAnswerDto);
  }
}