import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from '../entity/teacher.entity';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { TokenGeneratorModule } from 'src/common/token-generator/token-generator.module';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), TokenGeneratorModule],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
