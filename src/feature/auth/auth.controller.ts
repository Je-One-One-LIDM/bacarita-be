import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { DataResponse, MessageResponse } from 'src/core/http/http-response';
import { AuthService } from './auth.service';
import { TeacherSignInDTO } from './dtos/teacher-sign-in.dto';
import { ITokenResponse } from './interfaces/token-response.interface';
import { AuthGuard } from './guards/auth.guard';
import { Auth } from './decorators/auth.decorator';
import { AuthRole } from './enums/auth.enum';
import { CurrentUser } from './decorators/current-user.decorator';
import { ICurrentUser } from './interfaces/current-user.interfaces';

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
}
