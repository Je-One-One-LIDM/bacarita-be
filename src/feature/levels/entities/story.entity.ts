import { Expose } from 'class-transformer';
import { TestSession } from 'src/feature/test-session/entities/test-session.entity';
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
import { StoryStatus } from '../enum/story-status.enum';
import { Level } from './level.entity';
import { LevelProgress } from './level-progress.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Level, (level) => level.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'longtext' })
  description: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'longtext' })
  passage: string;

  @Column({
    type: 'enum',
    enum: StoryStatus,
    default: StoryStatus.WAITING_NEWLY,
  })
  status: StoryStatus = StoryStatus.WAITING_NEWLY;

  @OneToMany(
    () => TestSession,
    (testSession: TestSession) => testSession.student,
  )
  testSessions: TestSession[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  get imageUrl(): string | null {
    if (this.image) {
      return `${process.env.APP_URL}${this.image}`;
    }
    return null;
  }

  @Expose()
  get passageSentences(): string[] {
    return Story.passageToSentences(this.passage);
  }

  @Expose()
  public isCurrentStudentValidForStory(studentId: string): boolean {
    return (
      this.level?.levelProgresses?.some(
        (lp: LevelProgress) => lp.student.id === studentId && lp.isUnlocked,
      ) ?? false
    );
  }

  public static passageToSentences(passage: string): string[] {
    return passage
      .split(/[.\n]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);
  }
}
