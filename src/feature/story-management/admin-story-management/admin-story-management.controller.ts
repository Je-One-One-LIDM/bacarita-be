import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storyImageStorage } from 'src/config/upload/upload.config';
import { DataResponse } from 'src/core/http/http-response';
import { Auth } from 'src/feature/auth/decorators/auth.decorator';
import { AuthRole } from 'src/feature/auth/enums/auth.enum';
import { AuthGuard } from 'src/feature/auth/guards/auth.guard';
import { AdminStoryManagementService } from './admin-story-management.service';
import {
  LevelsOverviewDTO,
  LevelWithStoriesDTO,
  StoryDTO,
} from './dtos/admin-story-management.dto';
import { CreateStoryDTO } from './dtos/create-story.dto';

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

  @UseInterceptors(FileInterceptor('imageCover', storyImageStorage))
  @Post('levels/:levelId/stories')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Auth(AuthRole.ADMIN)
  public async createStory(
    @Param('levelId', ParseIntPipe) levelId: number,
    @Body() createStoryDTO: CreateStoryDTO,
    @UploadedFile() imageCover: Express.Multer.File,
  ): Promise<DataResponse<StoryDTO>> {
    this.adminStoryManagementService.validateStoryImageCover(imageCover);

    const storyDTO: StoryDTO =
      await this.adminStoryManagementService.createStory(
        createStoryDTO,
        levelId,
        imageCover,
      );
    return new DataResponse<StoryDTO>(
      HttpStatus.CREATED,
      'Berhasil membuat cerita baru.',
      storyDTO,
    );
  }
}
