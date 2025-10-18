import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ICurrentUser } from './interfaces/current-user.interfaces';
import { TeacherService } from '../users/teacher/teacher.service';
import { TeacherSignInDTO } from './dtos/teacher-sign-in.dto';
import { ITokenResponse } from './interfaces/token-response.interface';
import { Teacher } from '../users/entities/teacher.entity';
import { AuthRole } from './enums/auth.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly teacherService: TeacherService,
  ) {}

  public async loginTeacher(
    teacherSignInDto: TeacherSignInDTO,
  ): Promise<ITokenResponse> {
    let teacher: Teacher | null = null;
    if (teacherSignInDto.email && teacherSignInDto.username) {
      throw new ForbiddenException();
    }
    if (teacherSignInDto.email && !teacherSignInDto.username) {
      teacher = await this.teacherService.findByEmail(teacherSignInDto.email);
    }
    if (teacherSignInDto.username && !teacherSignInDto.email) {
      teacher = await this.teacherService.findByUsername(
        teacherSignInDto.username,
      );
    }
    if (!teacher) {
      throw new UnauthorizedException();
    }

    const isMatch: boolean = await bcrypt.compare(
      teacherSignInDto.password,
      teacher.password,
    );
    if (!isMatch) throw new UnauthorizedException('Kredensial salah');

    const currentUser: ICurrentUser = {
      id: teacher.id,
      email: teacher.email,
      username: teacher.username,
      role: AuthRole.TEACHER,
    };

    const token: string = this.generateJwtToken(currentUser);
    teacher.token = token;
    await this.teacherService.save(teacher);

    const tokenResponse: ITokenResponse = { token: token };

    return tokenResponse;
  }

  public generateJwtToken(user: ICurrentUser): string {
    return this.jwtService.sign(user);
  }

  public verifyJwtToken(token: string): ICurrentUser | null {
    try {
      return this.jwtService.verify<ICurrentUser>(token);
    } catch {
      return null;
    }
  }
}
