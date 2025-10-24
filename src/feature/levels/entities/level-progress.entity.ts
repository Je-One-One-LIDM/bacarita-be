import { Expose } from 'class-transformer';
import { Student } from 'src/feature/users/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoryMedalPoint } from '../enum/story-medal.enum';
import { Level } from './level.entity';

@Entity('level_progresses')
export class LevelProgress {
  @PrimaryColumn()
  student_id: string;

  @PrimaryColumn()
  level_id: number;

  @ManyToOne(() => Student, (student: Student) => student.levelProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Level, (level: Level) => level.levelProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column({ type: 'boolean', default: false })
  isUnlocked: boolean;

  @Expose()
  get currentPoints(): number {
    return this.calculateCurrentPoints();
  }

  @Expose()
  get progress(): number {
    const currentPoints: number = this.calculateCurrentPoints();
    const percentage: number = currentPoints / this.level.maxPoints;

    return Math.ceil(percentage * 100);
  }

  @Column({ type: 'int', default: 0 })
  goldCount: number;

  @Column({ type: 'int', default: 0 })
  silverCount: number;

  @Column({ type: 'int', default: 0 })
  bronzeCount: number;

  @Expose()
  get requiredPoints(): number {
    const currentPoints: number = this.calculateCurrentPoints();

    // target threshold (75% of maxPoints)
    const targetPoints: number = this.level.maxPoints * 0.75;
    const remaining: number = targetPoints - currentPoints;

    return Math.max(0, Math.ceil(remaining));
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  private calculateCurrentPoints(): number {
    return (
      this.goldCount * StoryMedalPoint.GOLD +
      this.silverCount * StoryMedalPoint.SILVER +
      this.bronzeCount * StoryMedalPoint.BRONZE
    );
  }
}
