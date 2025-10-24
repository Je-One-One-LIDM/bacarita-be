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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
