import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DataResponse } from 'src/core/http/http-response';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthRole } from '../auth/enums/auth.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ICurrentUser } from '../auth/interfaces/current-user.interfaces';
import { StudentLevelResponseDTO } from './dtos/student-level-response.dto';
import { LevelsService } from './levels.service';

@Controller('students/levels')
export class LevelsStudentController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Auth(AuthRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  public async getStudentLevels(
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DataResponse<StudentLevelResponseDTO[]>> {
    const levels: StudentLevelResponseDTO[] =
      await this.levelsService.getLevelForStudentWithProgresses(currentUser.id);

    return new DataResponse<StudentLevelResponseDTO[]>(
      HttpStatus.OK,
      `Berhasil mendapatkan daftar level dan progressnya untuk murid ${currentUser.username}`,
      levels,
    );
  }
}
