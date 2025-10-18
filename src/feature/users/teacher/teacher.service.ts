import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
import { CreateTeacherDTO } from './dto/create-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {}

  public async create(createTeacherDto: CreateTeacherDTO): Promise<Teacher> {
    if (createTeacherDto.password !== createTeacherDto.confirmPassword) {
      throw new BadRequestException(
        'Password harus sama dengan konfirmasi password',
      );
    }

    const existingTeacher = await this.teacherRepository.findOne({
      where: [
        { email: createTeacherDto.email },
        { username: createTeacherDto.username },
      ],
    });

    if (existingTeacher) {
      existingTeacher.email = existingTeacher.email.toLowerCase();
      createTeacherDto.email = createTeacherDto.email.toLowerCase();
      existingTeacher.username = existingTeacher.username.toLowerCase();
      createTeacherDto.username = createTeacherDto.username.toLowerCase();

      if (existingTeacher.email === createTeacherDto.email) {
        throw new BadRequestException('Email sudah terdaftar');
      }
      if (existingTeacher.username === createTeacherDto.username) {
        throw new BadRequestException('Username sudah terdaftar');
      }
    }

    const hashedPassword = await bcrypt.hash(createTeacherDto.password, 10);
    const teacher = this.teacherRepository.create({
      id: this.tokenGeneratorService.randomUUIDV7(),
      email: createTeacherDto.email,
      username: createTeacherDto.username,
      fullName: createTeacherDto.fullName,
      password: hashedPassword,
      schoolName: createTeacherDto.schoolName,
    });
    const savedTeacher = await this.teacherRepository.save(teacher);

    return {
      id: savedTeacher.id,
      email: savedTeacher.email,
      username: savedTeacher.username,
      fullName: savedTeacher.fullName,
      schoolName: savedTeacher.schoolName,
      createdAt: savedTeacher.createdAt,
      updatedAt: savedTeacher.updatedAt,
    } as Teacher;
  }

  public async findByEmail(email: string): Promise<Teacher | null> {
    return this.teacherRepository.findOneBy({ email });
  }

  public async findByUsername(username: string): Promise<Teacher | null> {
    return this.teacherRepository.findOneBy({ username });
  }

  public async findById(id: string): Promise<Teacher | null> {
    return this.teacherRepository.findOneBy({ id });
  }

  public async save(teacher: Teacher): Promise<Teacher> {
    return this.teacherRepository.save(teacher);
  }
}
