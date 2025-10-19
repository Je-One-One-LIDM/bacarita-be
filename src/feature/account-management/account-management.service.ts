import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Parent } from '../users/entities/parent.entity';
import { Student } from '../users/entities/student.entity';
import { Teacher } from '../users/entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountManagementService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {}

  public async createStudentWithParentAccount(
    studentUsername: string,
    studentFullName: string,
    parentEmail: string,
    parentFullName: string,
    teacherId: string,
  ): Promise<Student> {
    const existingStudent: Student | null =
      await this.studentRepository.findOne({
        where: {
          username: studentUsername,
        },
        relations: ['teacher', 'parent'],
      });

    if (existingStudent) {
      throw new BadRequestException(
        `Student dengan username ${studentUsername} sudah pernah terdaftar`,
      );
    }

    let parent: Parent | null = await this.parentRepository.findOne({
      where: {
        email: parentEmail,
      },
      relations: ['students'],
    });

    if (!parent) {
      const parentUsername: string = parentEmail.split('@')[0];
      const parentPassowrd: string = this.tokenGeneratorService.numericCode(6);
      const hashedPassword = await bcrypt.hash(parentPassowrd, 10);
      parent = this.parentRepository.create({
        id: this.tokenGeneratorService.randomUUIDV7(),
        username: parentUsername,
        email: parentEmail,
        password: hashedPassword,
        fullName: parentFullName,
      });
      await this.parentRepository.save(parent);
    }

    const studentPassword: string = this.tokenGeneratorService.numericCode(6);
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
    const student: Student = this.studentRepository.create({
      id: this.tokenGeneratorService.randomUUIDV7(),
      username: studentUsername,
      password: hashedStudentPassword,
      fullName: studentFullName,
    });
    student.parent = parent!; // parent is guaranteed to exist here

    const teacher = await this.teacherRepository.findOneBy({ id: teacherId });
    if (!teacher) {
      throw new BadRequestException(`Teacher with ID ${teacherId} not found`);
    }
    student.teacher = teacher;

    const savedStudent: Student = await this.studentRepository.save(student);

    return savedStudent;
  }
}
