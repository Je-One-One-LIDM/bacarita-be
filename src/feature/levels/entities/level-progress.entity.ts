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
import { Level } from './level.entity';
import { Expose } from 'class-transformer';
import { StoryMedalPoint } from '../enum/story-medal.enum';

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

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', default: 0 })
  goldCount: number;

  @Column({ type: 'int', default: 0 })
  silverCount: number;

  @Column({ type: 'int', default: 0 })
  bronzeCount: number;

  @Expose()
  get requiredPoints(): number {
    const currentPoints: number =
      this.goldCount * StoryMedalPoint.GOLD +
      this.silverCount * StoryMedalPoint.SILVER +
      this.bronzeCount * StoryMedalPoint.BRONZE;
    return this.level.maxPoints - currentPoints;
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
