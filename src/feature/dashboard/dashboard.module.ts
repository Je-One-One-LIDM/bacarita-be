import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LevelProgress } from '../levels/entities/level-progress.entity';
import { Level } from '../levels/entities/level.entity';
import { TestSession } from '../test-session/entities/test-session.entity';
import { Parent } from '../users/entities/parent.entity';
import { Student } from '../users/entities/student.entity';
import { Teacher } from '../users/entities/teacher.entity';
import { TeacherDashboardController } from './teacher-dashboard/teacher-dashboard.controller';
import { TeacherDashboardService } from './teacher-dashboard/teacher-dashboard.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Teacher,
      Student,
      Parent,
      TestSession,
      Level,
      LevelProgress,
    ]),
  ],
  controllers: [TeacherDashboardController],
  providers: [TeacherDashboardService],
  exports: [TeacherDashboardService],
})
export class DashboardModule {}
