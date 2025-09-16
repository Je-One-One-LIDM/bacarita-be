import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('parents')
export class Parent {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 90, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ nullable: true })
  token: string;

  @OneToMany(() => Student, (student: Student) => student.parent)
  students: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
