import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { ITransactionalService } from 'src/common/base-transaction/transactional.interface.service';
import { MailService } from 'src/common/mail/mail.service';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Parent } from '../users/entities/parent.entity';
import { Student } from '../users/entities/student.entity';
import { Teacher } from '../users/entities/teacher.entity';
import { IParentProfile } from '../users/teacher/interfaces/parent-profile.interace';

@Injectable()
export class AccountManagementService extends ITransactionalService {
  constructor(
    dataSource: DataSource,

    private readonly logger: PinoLogger,

    private readonly mailService: MailService,

    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {
    super(dataSource);
    this.logger.setContext(AccountManagementService.name);
  }

  public async createStudentWithParentAccount(
    studentUsername: string,
    studentFullName: string,
    parentEmail: string,
    teacherId: string,
    parentFullName?: string,
  ): Promise<Student> {
    return this.withTransaction<Student>(async (manager: EntityManager) => {
      const studentRepo: Repository<Student> = manager.getRepository(Student);
      const parentRepo: Repository<Parent> = manager.getRepository(Parent);
      const teacherRepo: Repository<Teacher> = manager.getRepository(Teacher);

      let isParentAlreadyExists: boolean = true;
      let parentPassword: string;

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
        isParentAlreadyExists = false;
        if (!parentFullName) {
          throw new BadRequestException(
            `Orang tua dengan email ${parentEmail} belum terdaftar, mohon sertakan nama lengkap orang tua`,
          );
        }

        const parentUsername: string = parentEmail.split('@')[0];
        parentPassword = this.tokenGeneratorService.numericCode(6);
        const hashedPassword: string = await bcrypt.hash(parentPassword, 10);
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

      if (!isParentAlreadyExists) {
        try {
          // send welcome email that contains both parent and student account info
          await this.mailService.sendFirstTimeWelcomeParentWithStudentEmail(
            parent.email,
            parent.username,
            parentPassword!, // parentPassword is guaranteed to exist if parent is newly created
            student.username,
            studentPassword,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send welcome email to parent ${parent.email}: ${error}`,
          );
          throw new InternalServerErrorException(
            'Gagal mengirim email sambutan kepada orang tua',
          );
        }
      } else {
        try {
          // send email that contains only student account info
          await this.mailService.sendStudentAccountInfoToParentEmail(
            parent.email,
            student.username,
            studentPassword,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send student account info email to parent ${parent.email}: ${error}`,
          );
          throw new InternalServerErrorException(
            'Gagal mengirim email informasi akun siswa ke orang tua',
          );
        }
      }

      return savedStudent;
    });
  }

  public async getAllStudentsParentsEmailAndFullname(): Promise<
    IParentProfile[]
  > {
    const parents: Parent[] = await this.parentRepository.find({
      relations: ['students'],
      order: {
        email: 'ASC',
      },
    });

    const parentsProfile: IParentProfile[] = parents
      .filter((parent) => parent.students && parent.students.length > 0)
      .map(
        (parent) =>
          ({
            email: parent.email,
            fullName: parent.fullName,
          }) as IParentProfile,
      );

    return parentsProfile;
  }
}
