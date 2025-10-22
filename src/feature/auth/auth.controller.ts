import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { DataResponse, MessageResponse } from 'src/core/http/http-response';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ParentSignInDTO } from './dtos/parent-sign-in.dto';
import { StudentSignInDTO } from './dtos/student-sign-in.dto';
import { TeacherSignInDTO } from './dtos/teacher-sign-in.dto';
import { AuthRole } from './enums/auth.enum';
import { AuthGuard } from './guards/auth.guard';
import { ICurrentUser } from './interfaces/current-user.interfaces';
import { ITokenResponse } from './interfaces/token-response.interface';
import { Student } from '../users/entities/student.entity';
import { Parent } from '../users/entities/parent.entity';
import { Teacher } from '../users/entities/teacher.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @Auth(AuthRole.ANY)
  public async me(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DataResponse<Student | Parent | Teacher>> {
    const profile: Student | Parent | Teacher | null =
      await this.authService.getProfile(
        currentUser.id,
        currentUser.role as AuthRole,
      );

    return new DataResponse<Student | Parent | Teacher>(
      200,
      `Berhasil mendapatkan data profile ${currentUser.role.toLowerCase()}`,
      instanceToPlain(profile) as Student | Parent | Teacher,
    );
  }

  @Post('teachers/login')
  @HttpCode(200)
  public async loginTeacher(
    @Body() teacherSignInDto: TeacherSignInDTO,
  ): Promise<DataResponse<ITokenResponse>> {
    const response: ITokenResponse =
      await this.authService.loginTeacher(teacherSignInDto);

    return new DataResponse<ITokenResponse>(
      200,
      'Login berhasil (guru)',
      instanceToPlain(response) as ITokenResponse,
    );
  }

  @Post('teachers/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.TEACHER)
  public async logoutTeacher(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<MessageResponse> {
    await this.authService.logoutTeacher(currentUser.id);
    return new MessageResponse(200, 'Logout berhasil (guru)');
  }

  @Post('students/login')
  @HttpCode(200)
  public async loginStudent(
    @Body() studentSignInDto: StudentSignInDTO,
  ): Promise<DataResponse<ITokenResponse>> {
    const response: ITokenResponse =
      await this.authService.loginStudent(studentSignInDto);

    return new DataResponse<ITokenResponse>(
      200,
      'Login berhasil (siswa)',
      instanceToPlain(response) as ITokenResponse,
    );
  }

  @Post('students/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.STUDENT)
  public async logoutStudent(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<MessageResponse> {
    await this.authService.logoutStudent(currentUser.id);
    return new MessageResponse(200, 'Logout berhasil (siswa)');
  }

  @Post('parents/login')
  @HttpCode(200)
  public async loginParent(
    @Body() parentSignInDto: ParentSignInDTO,
  ): Promise<DataResponse<ITokenResponse>> {
    const response: ITokenResponse =
      await this.authService.loginParent(parentSignInDto);

    return new DataResponse<ITokenResponse>(
      200,
      'Login berhasil (orang tua)',
      instanceToPlain(response) as ITokenResponse,
    );
  }

  @Post('parents/logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.PARENT)
  public async logoutParent(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<MessageResponse> {
    await this.authService.logoutParent(currentUser.id);
    return new MessageResponse(200, 'Logout berhasil (orang tua)');
  }
}
