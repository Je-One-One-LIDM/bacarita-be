import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { TeacherModule } from './teacher/teacher.module';
import { TokenGeneratorModule } from 'src/common/token-generator/token-generator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parent, Student, Teacher]),
    TeacherModule,
    TokenGeneratorModule,
  ],
})
export class UsersModule {}
