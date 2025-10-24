import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StudentLevelResponseDTO,
  StudentStoryResponseDTO,
} from './dtos/student-level-response.dto';
import { LevelProgress } from './entities/level-progress.entity';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(LevelProgress)
    private readonly levelProgressRepository: Repository<LevelProgress>,
  ) {}

  public async getLevels(): Promise<Level[]> {
    return this.levelRepository.find({
      relations: ['stories'],
      order: {
        no: 'ASC',
        name: 'ASC',
      },
    });
  }

  public async getLevelForStudentWithProgresses(
    studentId: string,
  ): Promise<StudentLevelResponseDTO[]> {
    const levels = await this.levelRepository.find({
      relations: ['stories', 'levelProgresses'],
      order: { no: 'ASC' },
    });

    const progressMap: Map<number, LevelProgress> = new Map<
      number,
      LevelProgress
    >();
    const progresses: LevelProgress[] = await this.levelProgressRepository.find(
      {
        where: { student_id: studentId },
      },
    );

    for (const p of progresses) progressMap.set(p.level_id, p);

    const studentLevelsResponse: StudentLevelResponseDTO[] = [];
    for (const level of levels) {
      const progress = progressMap.get(level.id);
      if (!progress) {
        const newProgress: LevelProgress = this.levelProgressRepository.create({
          student_id: studentId,
          level_id: level.id,
          isUnlocked: level.no === 1 ? true : false,
        });

        await this.levelProgressRepository.save(newProgress);
        progressMap.set(level.id, newProgress);
      }

      const levelProgress: LevelProgress = progressMap.get(level.id)!; // guaranteed to exist

      studentLevelsResponse.push({
        id: level.id,
        name: level.name,
        isUnlocked: levelProgress.isUnlocked,
        requiredPoints: level.no * 3,
        isBonusLevel: level.isBonusLevel,
        maxPoints: level.maxPoints,
        goldCount: levelProgress.goldCount,
        silverCount: levelProgress.silverCount,
        bronzeCount: levelProgress.bronzeCount,
        progress: levelProgress.progress,
        stories: level.stories.map((story) => {
          const storyResponse: StudentStoryResponseDTO = {
            id: story.id,
            title: story.title,
            description: story.description,
            imageUrl: story.image,
            isGoldMedal: false, // TODO: medal logic get the highest medal of TestSessions
            isSilverMedal: false, // TODO: medal logic get the highest medal of TestSessions
            isBronzeMedal: false, // TODO: medal logic get the highest medal of TestSessions
          };
          return storyResponse;
        }),
      });
    }

    return studentLevelsResponse;
  }

  public async getLevelById(id: number): Promise<Level> {
    const level: Level | null = await this.levelRepository.findOne({
      where: { id },
      relations: ['stories'],
    });

    if (!level) {
      throw new NotFoundException(`Level dengan id ${id} tidak ditemukan`);
    }

    return level;
  }
}
