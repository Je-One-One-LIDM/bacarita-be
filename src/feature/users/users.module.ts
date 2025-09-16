import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entity/parent.entity';
import { Student } from './entity/student.entity';
import { Teacher } from './entity/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parent, Student, Teacher])],
})
export class UsersModule {}
