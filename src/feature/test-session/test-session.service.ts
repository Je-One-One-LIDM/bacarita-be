import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { ITransactionalService } from 'src/common/base-transaction/transactional.interface.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Story } from '../levels/entities/story.entity';
import { Student } from '../users/entities/student.entity';
import { StudentService } from '../users/student/student.service';
import { TestSession } from './entities/test-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import { TestSessionResponseDTO } from './dtos/test-session-response.dto';

@Injectable()
export class TestSessionService extends ITransactionalService {
  constructor(
    dataSource: DataSource,

    private readonly logger: PinoLogger,

    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,

    private readonly studentService: StudentService,

    @InjectRepository(TestSession)
    private readonly testSessionRepository: Repository<TestSession>,

    private readonly tokenGeneratorService: TokenGeneratorService,
  ) {
    super(dataSource);
    this.logger.setContext(TestSessionService.name);
  }

  public async startNewTestSession(
    studentId: string,
    storyId: number,
  ): Promise<TestSessionResponseDTO> {
    return this.withTransaction<TestSessionResponseDTO>(
      async (manager: EntityManager) => {
        const storyRepo: Repository<Story> = manager.getRepository(Story);
        const testSessionRepo: Repository<TestSession> =
          manager.getRepository(TestSession);

        const currentStudent: Student | null =
          await this.studentService.findById(studentId);
        if (!currentStudent) {
          throw new NotFoundException(
            `Siswa dengan ID ${studentId} tidak ditemukan`,
          );
        }

        const currentStory: Story | null = await storyRepo.findOne({
          where: { id: storyId },
          relations: [
            'level',
            'level.levelProgresses',
            'level.levelProgresses.level',
            'level.levelProgresses.student',
          ],
        });
        if (!currentStory) {
          throw new NotFoundException(
            `Cerita (Story) dengan ID ${storyId} tidak ditemukan`,
          );
        }

        if (!currentStory.isCurrentStudentValidForStory(studentId)) {
          throw new ForbiddenException(
            `Siswa dengan ID ${studentId} tidak memiliki akses ke cerita (story) ini`,
          );
        }

        const newTestSession: TestSession = testSessionRepo.create({
          id: 'TESTSESSION-' + this.tokenGeneratorService.randomUUIDV7(),
          titleAtTaken: currentStory.title,
          imageAtTaken: currentStory.image,
          descriptionAtTaken: currentStory.description,
          passageAtTaken: currentStory.passage,
          student: { id: studentId } as Student,
          story: { id: storyId } as Story,
        });

        const savedTestSession: TestSession =
          await testSessionRepo.save(newTestSession);

        const { level, ...storyWithoutLevel } = currentStory;
        const testSessionDTO: TestSessionResponseDTO = {
          id: savedTestSession.id,
          student: currentStudent,
          story: storyWithoutLevel as Story,
          levelFullName: level.fullName,
          titleAtTaken: savedTestSession.titleAtTaken,
          imageAtTaken: savedTestSession.imageAtTaken,
          imageAtTakenUrl: savedTestSession.imageAtTakenUrl,
          descriptionAtTaken: savedTestSession.descriptionAtTaken,
          passageAtTaken: savedTestSession.passageAtTaken,
          passagesAtTaken: Story.passageToSentences(
            savedTestSession.passageAtTaken,
          ),
          startedAt: savedTestSession.startedAt,
          finishedAt: savedTestSession.finishedAt,
          medal: savedTestSession.medal,
          score: savedTestSession.score,
          isCompleted: !!savedTestSession.finishedAt,
          createdAt: savedTestSession.createdAt,
          updatedAt: savedTestSession.updatedAt,
        };

        return testSessionDTO;
      },
    );
  }
}
