import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Auth } from 'src/feature/auth/decorators/auth.decorator';
import { AuthRole } from 'src/feature/auth/enums/auth.enum';
import { AuthGuard } from 'src/feature/auth/guards/auth.guard';
import { AdminStoryManagementService } from './admin-story-management.service';
import {
  LevelsOverviewDTO,
  LevelWithStoriesDTO,
} from './dtos/admin-story-management.dto';
import { DataResponse } from 'src/core/http/http-response';

@Controller('admin')
export class AdminStoryManagementController {
  constructor(
    private readonly adminStoryManagementService: AdminStoryManagementService,
  ) {}

  @Get('stories/overview')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.ADMIN)
  public async getOverview(): Promise<DataResponse<LevelsOverviewDTO>> {
    const levelsOverviewDTO: LevelsOverviewDTO =
      await this.adminStoryManagementService.getOverview();
    return new DataResponse<LevelsOverviewDTO>(
      HttpStatus.OK,
      'Berhasil mengambil overview cerita dan level.',
      levelsOverviewDTO,
    );
  }

  @Get('levels/:levelId/stories')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.ADMIN)
  public async getStoriesForLevel(
    @Param('levelId', ParseIntPipe) levelId: number,
  ): Promise<DataResponse<LevelWithStoriesDTO>> {
    const levelsOverviewDTO: LevelWithStoriesDTO =
      await this.adminStoryManagementService.getStoriesForLevel(levelId);
    return new DataResponse<LevelWithStoriesDTO>(
      HttpStatus.OK,
      'Berhasil mengambil overview cerita dan level.',
      levelsOverviewDTO,
    );
  }
}
