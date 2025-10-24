import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoryStatus } from '../enum/story-status.enum';
import { Level } from './level.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
