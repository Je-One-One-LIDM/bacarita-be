import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DataResponse } from 'src/core/http/http-response';
import { AuthService } from './auth.service';
import { TeacherSignInDTO } from './dtos/teacher-sign-in.dto';
import { ITokenResponse } from './interfaces/token-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      response,
    );
  }
}
