import { Expose } from 'class-transformer';
import { Teacher } from 'src/feature/users/entities/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LevelProgress } from './level-progress.entity';
import { Story } from './story.entity';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  no: number;

  @Column({ type: 'varchar', length: 90 })
  name: string;

  @Expose()
  get fullName(): string {
    return `Level ${this.no}. ${this.name}`;
  }

  @Column({ type: 'boolean', default: false })
  isBonusLevel: boolean;

  @ManyToOne(() => Teacher, (teacher: Teacher) => teacher.levelsCreated, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(
    () => LevelProgress,
    (levelProgress: LevelProgress) => levelProgress.level,
  )
  levelProgresses: LevelProgress[];

  @Expose()
  get maxPoints(): number {
    return (this.stories?.length ?? 0) * 3;
  }

  @OneToMany(() => Story, (story: Story) => story.level)
  stories: Story[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
