import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Level } from '../levels/entities/level.entity';
import { Story } from '../levels/entities/story.entity';
import { AdminStoryManagementController } from './admin-story-management/admin-story-management.controller';
import { AdminStoryManagementService } from './admin-story-management/admin-story-management.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level, Story]), AuthModule],
  controllers: [AdminStoryManagementController],
  providers: [AdminStoryManagementService],
})
export class StoryManagementModule {}
