import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('teachers')
export class Teacher {
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

  @OneToMany(() => Student, (student: Student) => student.teacher)
  students: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
