import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenGeneratorModule } from 'src/common/token-generator/token-generator.module';
import { AuthModule } from '../auth/auth.module';
import { LevelProgress } from '../levels/entities/level-progress.entity';
import { Level } from '../levels/entities/level.entity';
import { Story } from '../levels/entities/story.entity';
import { StudentModule } from '../users/student/student.module';
import { TestSession } from './entities/test-session.entity';
import { StudentTestSessionController } from './test-session-student.controller';
import { TestSessionService } from './test-session.service';

@Module({
  imports: [
    AuthModule,

    TypeOrmModule.forFeature([TestSession, Level, LevelProgress, Story]),

    StudentModule,

    TokenGeneratorModule,
  ],
  controllers: [StudentTestSessionController],
  providers: [TestSessionService],
})
export class TestSessionModule {}
