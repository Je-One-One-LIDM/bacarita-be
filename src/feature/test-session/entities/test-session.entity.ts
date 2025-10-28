import { Expose } from 'class-transformer';
import { Story } from 'src/feature/levels/entities/story.entity';
import { StoryMedal } from 'src/feature/levels/enum/story-medal.enum';
import { Student } from 'src/feature/users/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('test_sessions')
export class TestSession {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Student, (student: Student) => student.testSessions, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => Story, (story: Story) => story.testSessions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  story?: Story;

  @Column()
  titleAtTaken: string;

  @Column({ nullable: true })
  imageAtTaken?: string;

  @Column({ nullable: true, type: 'longtext' })
  descriptionAtTaken: string;

  @Column({ type: 'longtext' })
  passageAtTaken: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt?: Date;

  @Column({
    type: 'enum',
    enum: StoryMedal,
    default: null,
    nullable: true,
  })
  medal?: StoryMedal;

  @Column({ type: 'float', nullable: true })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  get imageAtTakenUrl(): string | null {
    if (this.imageAtTaken) {
      return `${process.env.APP_URL}${this.imageAtTaken}`;
    }
    return null;
  }

  @Expose()
  get remainingTimeInSeconds(): number {
    const TEST_SESSION_TEST_DURATION_IN_SECONDS = 120 * 60;
    if (this.startedAt && !this.finishedAt) {
      const now = new Date();
      const elapsedTimeInSeconds = Math.floor(
        (now.getTime() - this.startedAt.getTime()) / 1000,
      );
      const remainingTime =
        TEST_SESSION_TEST_DURATION_IN_SECONDS - elapsedTimeInSeconds;
      return remainingTime > 0 ? remainingTime : 0;
    }

    return 0;
  }
}
