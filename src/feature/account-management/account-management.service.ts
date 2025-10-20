import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Parent } from '../users/entities/parent.entity';
import { Student } from '../users/entities/student.entity';
import { Teacher } from '../users/entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import * as bcrypt from 'bcrypt';
import { ITransactionalService } from 'src/common/base-transaction/transactional.interface.service';

@Injectable()
export class AccountManagementService extends ITransactionalService {
  constructor(
    dataSource: DataSource,

    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {
    super(dataSource);
  }

  public async createStudentWithParentAccount(
    studentUsername: string,
    studentFullName: string,
    parentEmail: string,
    parentFullName: string,
    teacherId: string,
  ): Promise<Student> {
    return this.withTransaction<Student>(async (manager: EntityManager) => {
      const studentRepo: Repository<Student> = manager.getRepository(Student);
      const parentRepo: Repository<Parent> = manager.getRepository(Parent);
      const teacherRepo: Repository<Teacher> = manager.getRepository(Teacher);

      const existingStudent: Student | null = await studentRepo.findOne({
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

      const teacher: Teacher | null = await teacherRepo.findOneBy({
        id: teacherId,
      });
      if (!teacher) {
        throw new BadRequestException(
          `Teacher dengan ID ${teacherId} tidak ditemukan`,
        );
      }

      let parent: Parent | null = await parentRepo.findOne({
        where: {
          email: parentEmail,
        },
        relations: ['students'],
      });

      if (!parent) {
        const parentUsername: string = parentEmail.split('@')[0];
        const parentPassowrd: string =
          this.tokenGeneratorService.numericCode(6);
        const hashedPassword: string = await bcrypt.hash(parentPassowrd, 10);
        parent = parentRepo.create({
          id: this.tokenGeneratorService.randomUUIDV7(),
          username: parentUsername,
          email: parentEmail,
          password: hashedPassword,
          fullName: parentFullName,
        });
        await parentRepo.save(parent);
      }

      const studentPassword: string = this.tokenGeneratorService.numericCode(6);
      const hashedStudentPassword: string = await bcrypt.hash(
        studentPassword,
        10,
      );
      const student: Student = studentRepo.create({
        id: this.tokenGeneratorService.randomUUIDV7(),
        username: studentUsername,
        password: hashedStudentPassword,
        fullName: studentFullName,
      });
      student.parent = parent!; // parent is guaranteed to exist here

      student.teacher = teacher;

      const savedStudent: Student = await studentRepo.save(student);

      return savedStudent;
    });
  }
}
