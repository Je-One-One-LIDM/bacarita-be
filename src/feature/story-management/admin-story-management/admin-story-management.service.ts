import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/feature/levels/entities/level.entity';
import { Story } from 'src/feature/levels/entities/story.entity';
import { Repository } from 'typeorm';
import { LevelDTO, LevelsOverviewDTO } from './dtos/admin-story-management.dto';

@Injectable()
export class AdminStoryManagementService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
  ) {}

  public async getOverview(): Promise<LevelsOverviewDTO> {
    const levels: Level[] = await this.levelRepository.find({
      order: { no: 'ASC' },
    });

    const storiesCount: number = await this.storyRepository.count();

    const levelDTOs: LevelDTO[] = levels.map((level: Level) => ({
      id: level.id,
      no: level.no,
      name: level.name,
      fullName: level.fullName,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    }));

    const levelsOverviewDTO: LevelsOverviewDTO = {
      levels: levelDTOs,
      levelsCount: levels.length,
      storiesCount,
    };

    return levelsOverviewDTO;
  }
}
