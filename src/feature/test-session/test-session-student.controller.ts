import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthRole } from '../auth/enums/auth.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TestSessionService } from './test-session.service';
import { StartNewTestSessionDTO } from './dtos/start-new-test-session.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ICurrentUser } from '../auth/interfaces/current-user.interfaces';
import { DataResponse } from 'src/core/http/http-response';
import { TestSessionResponseDTO } from './dtos/test-session-response.dto';

@Controller('students/test-sessions')
export class StudentTestSessionController {
  constructor(private readonly testSessionService: TestSessionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Auth(AuthRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  public async startNewTestSession(
    @Body() newTestSession: StartNewTestSessionDTO,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DataResponse<TestSessionResponseDTO>> {
    const newlyCreatedTestSession: TestSessionResponseDTO =
      await this.testSessionService.startNewTestSession(
        currentUser.id,
        newTestSession.storyId,
      );

    return new DataResponse<TestSessionResponseDTO>(
      HttpStatus.CREATED,
      `Berhasil memulai sesi tes baru untuk murid ${currentUser.username}, cerita (story) ID ${newTestSession.storyId}, sesi tes ID ${newlyCreatedTestSession.id}`,
      newlyCreatedTestSession,
    );
  }
}
