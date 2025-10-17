import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DataResponse } from 'src/core/http/http-response';
import { Teacher } from '../entity/teacher.entity';
import { CreateTeacherDTO } from './dto/create-teacher.dto';
import { TeacherService } from './teacher.service';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @HttpCode(201)
  public async createTeacher(
    @Body() createTeacherDto: CreateTeacherDTO,
  ): Promise<DataResponse<Teacher>> {
    const newTeacher: Teacher =
      await this.teacherService.create(createTeacherDto);

    return new DataResponse(201, 'Berhasil registrasi guru', newTeacher);
  }
}
