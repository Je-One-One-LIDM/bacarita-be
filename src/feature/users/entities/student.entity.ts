import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parent } from './parent.entity';
import { Teacher } from './teacher.entity';

@Entity('students')
export class Student {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 90, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ nullable: true })
  token: string;

  @ManyToOne(() => Teacher, (teacher: Teacher) => teacher.students)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Parent, (parent: Parent) => parent.students)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
