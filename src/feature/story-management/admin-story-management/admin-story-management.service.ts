import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/feature/levels/entities/level.entity';
import { Story } from 'src/feature/levels/entities/story.entity';
import { Repository } from 'typeorm';
import {
  LevelDTO,
  LevelsOverviewDTO,
  LevelWithStoriesDTO,
  StoryDTO,
} from './dtos/admin-story-management.dto';

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

    const levelDTOs: LevelDTO[] = await Promise.all(
      levels.map(async (level: Level) => ({
        id: level.id,
        no: level.no,
        name: level.name,
        fullName: level.fullName,
        storyCount: await this.storyRepository.count({
          where: { level: { id: level.id } },
        }),
        createdAt: level.createdAt,
        updatedAt: level.updatedAt,
      })),
    );

    const levelsOverviewDTO: LevelsOverviewDTO = {
      levels: levelDTOs,
      levelsCount: levels.length,
      storiesCount,
    };

    return levelsOverviewDTO;
  }

  public async getStoriesForLevel(
    levelId: number,
  ): Promise<LevelWithStoriesDTO> {
    const level: Level | null = await this.levelRepository.findOne({
      where: { id: levelId },
      relations: ['stories'],
      order: { no: 'ASC' },
    });

    if (!level) {
      throw new NotFoundException(`Level ${levelId} tidak ditemukan.`);
    }

    const storyDTOs: StoryDTO[] = level.stories.map((story: Story) => ({
      id: story.id,
      title: story.title,
      description: story.description,
      image: story.image,
      imageUrl: story.imageUrl,
      passage: story.passage,
      sentences: story.passageSentences,
      status: story.status,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    }));

    const levelWithStoriesDTO: LevelWithStoriesDTO = {
      id: level.id,
      no: level.no,
      name: level.name,
      fullName: level.fullName,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      stories: storyDTOs,
    };

    return levelWithStoriesDTO;
  }
}
