import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Auth } from 'src/feature/auth/decorators/auth.decorator';
import { AuthRole } from 'src/feature/auth/enums/auth.enum';
import { AuthGuard } from 'src/feature/auth/guards/auth.guard';
import { AdminStoryManagementService } from './admin-story-management.service';
import { LevelsOverviewDTO } from './dtos/admin-story-management.dto';
import { DataResponse } from 'src/core/http/http-response';

@Controller('admin/stories')
export class AdminStoryManagementController {
  constructor(
    private readonly adminStoryManagementService: AdminStoryManagementService,
  ) {}

  @Get()
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
}
