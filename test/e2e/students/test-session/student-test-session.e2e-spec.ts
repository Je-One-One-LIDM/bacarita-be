/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import { LevelSeeder } from 'src/database/seeders/level.seeder';
import { OpenRouterService } from 'src/feature/ai/open-router.service';
import { Level } from 'src/feature/levels/entities/level.entity';
import { Story } from 'src/feature/levels/entities/story.entity';
import { TestSession } from 'src/feature/test-session/entities/test-session.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import { clearDatabase } from '../../../utils/testing-database.utils';

describe('Student Test Session (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;
  let tokenGeneratorService: TokenGeneratorService;
  let openRouterService: OpenRouterService;
  let generateQuestionsFromStoryPassageSpy: jest.SpyInstance<
    Promise<string[]>,
    [passage: string]
  >;
  let randomUUIDV7: jest.SpyInstance<string, [length?: number | undefined]>;
  let randomNumericCode: jest.SpyInstance<
    string,
    [length?: number | undefined]
  >;

  beforeAll(async () => {
    app = await createTestingApp();
    requestTestAgent = request(app.getHttpServer());
  }, 15000);

  beforeEach(async () => {
    await clearDatabase(app);

    const mailService: MailService = app.get(MailService);
    jest
      .spyOn(mailService, 'sendFirstTimeWelcomeParentWithStudentEmail')
      .mockResolvedValue(undefined);
    jest
      .spyOn(mailService, 'sendStudentAccountInfoToParentEmail')
      .mockResolvedValue(undefined);

    tokenGeneratorService = app.get(TokenGeneratorService);
    randomUUIDV7 = jest.spyOn(tokenGeneratorService, 'randomUUIDV7');
    randomUUIDV7.mockReturnValue('1');
    randomNumericCode = jest.spyOn(tokenGeneratorService, 'numericCode');
    randomNumericCode.mockReturnValue('123456');

    openRouterService = app.get(OpenRouterService);
    generateQuestionsFromStoryPassageSpy = jest.spyOn(
      openRouterService,
      'generateQuestionsFromStoryPassage',
    );
    generateQuestionsFromStoryPassageSpy.mockResolvedValue([
      'Rafi 1',
      'Rafi 2',
      'Rafi 3',
      'Rafi 4',
    ]);

    // Create a test teacher and student
    await requestTestAgent.post('/teachers').send({
      email: 'teacher1@gmail.com',
      username: 'teacher1',
      password: 'teacher1password',
      confirmPassword: 'teacher1password',
      fullName: 'Teacher One',
      schoolName: 'School Name 1',
    });
    const signInResponse = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'teacher1password',
      })
      .expect(200);
    const token = signInResponse.body.data.token;
    await requestTestAgent
      .post('/teachers/students')
      .send({
        studentUsername: 'student1',
        studentFullName: 'Student One',
        parentEmail: 'parent1@gmail.com',
        parentFullName: 'Parent One',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const levelSeeder: LevelSeeder = new LevelSeeder(
      app.get<DataSource>(DataSource),
    );
    await levelSeeder.run();

    randomUUIDV7.mockReturnValue('2');
    await requestTestAgent
      .post('/teachers/students')
      .send({
        studentUsername: 'student2',
        studentFullName: 'Student Two',
        parentEmail: 'parent2@gmail.com',
        parentFullName: 'Parent Two',
        jumpLevelTo: 1, // start at level 2
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    randomUUIDV7.mockReset();
    randomNumericCode.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // none
  });

  it('POST /students/test-sessions | must create a new TestSession if valid', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    const level3: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 3 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();
    expect(level3).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const body = response.body.data;
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    expect(body.levelFullName).toBe(level2!.fullName);
    expect(body.story.id).toBe(level2!.stories[0].id);
    expect(body.titleAtTaken).toBe(level2!.stories[0].title);
    expect(body.imageAtTaken).toBe(level2!.stories[0].image);
    expect(body.imageAtTakenUrl).toBe(
      level2!.stories[0].image
        ? `${process.env.APP_URL}${level2!.stories[0].image}`
        : null,
    );
    expect(body.descriptionAtTaken).toBe(level2!.stories[0].description);
    expect(body.passageAtTaken).toBe(level2!.stories[0].passage);
    expect(body.passagesAtTaken).toStrictEqual(
      Story.passageToSentences(level2!.stories[0].passage),
    );
    expect(body.finishedAt).toBeNull();
    expect(body.remainingTimeInSeconds).toBeGreaterThan(7100);
    expect(body.remainingTimeInSeconds).toBeLessThan(7202);
    expect(body.medal).toBeNull();
    expect(body.score).toBeNull();
    expect(body.isCompleted).toBe(false);
  });

  it('POST /students/test-sessions | must reject if stories is in locked level', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    const level3: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 3 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();
    expect(level3).not.toBeNull();

    await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level3!.stories[0].id, // level 3 is locked
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('POST /students/test-sessions | must reject create a new TestSession if not authenticated ', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: 10,
      })
      .set('Authorization', `Bearer ${token}+invalid`)
      .expect(401);
  });

  it('GET /students/test-sessions/:id/status | must return and handle a valid TestSession', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    const level3: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 3 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();
    expect(level3).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const body = response.body.data;
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    expect(body.levelFullName).toBe(level2!.fullName);
    expect(body.story.id).toBe(level2!.stories[0].id);
    expect(body.titleAtTaken).toBe(level2!.stories[0].title);
    expect(body.imageAtTaken).toBe(level2!.stories[0].image);
    expect(body.imageAtTakenUrl).toBe(
      level2!.stories[0].image
        ? `${process.env.APP_URL}${level2!.stories[0].image}`
        : null,
    );
    expect(body.descriptionAtTaken).toBe(level2!.stories[0].description);
    expect(body.passageAtTaken).toBe(level2!.stories[0].passage);
    expect(body.passagesAtTaken).toStrictEqual(
      Story.passageToSentences(level2!.stories[0].passage),
    );
    expect(body.finishedAt).toBeNull();
    expect(body.remainingTimeInSeconds).toBeGreaterThan(7100);
    expect(body.remainingTimeInSeconds).toBeLessThan(7202);
    expect(body.medal).toBeNull();
    expect(body.score).toBeNull();
    expect(body.isCompleted).toBe(false);

    const testSessionId = body.id;

    const statusResponse = await requestTestAgent
      .get(`/students/test-sessions/${testSessionId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const statusBody = statusResponse.body.data;
    expect(statusBody).toBeDefined();
    expect(statusBody.id).toBe(testSessionId);
    expect(statusBody.levelFullName).toBe(level2!.fullName);
    expect(statusBody.story.id).toBe(level2!.stories[0].id);
    expect(statusBody.titleAtTaken).toBe(level2!.stories[0].title);
    expect(statusBody.imageAtTaken).toBe(level2!.stories[0].image);
    expect(statusBody.imageAtTakenUrl).toBe(
      level2!.stories[0].image
        ? `${process.env.APP_URL}${level2!.stories[0].image}`
        : null,
    );
    expect(statusBody.descriptionAtTaken).toBe(level2!.stories[0].description);
    expect(statusBody.passageAtTaken).toBe(level2!.stories[0].passage);
    expect(statusBody.passagesAtTaken).toStrictEqual(
      Story.passageToSentences(level2!.stories[0].passage),
    );
    expect(statusBody.finishedAt).toBeNull();
    expect(statusBody.remainingTimeInSeconds).toBeGreaterThan(7000);
    expect(statusBody.remainingTimeInSeconds).toBeLessThan(7205);
    expect(statusBody.medal).toBeNull();
    expect(statusBody.score).toBeNull();
    expect(statusBody.isCompleted).toBe(false);
  });

  it('GET /students/test-sessions/:id/status || GET /students/test-sessions/:id | must return and handle a completed TestSession', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    const level3: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 3 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();
    expect(level3).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const body = response.body.data;
    const testSessionId = body.id;

    await app
      .get<DataSource>(DataSource)
      .getRepository(TestSession)
      .update(
        { id: testSessionId },
        {
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // started 3 hours ago
        },
      );

    await requestTestAgent
      .get(`/students/test-sessions/${testSessionId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    const testSessionAfter: TestSession | null = await app
      .get<DataSource>(DataSource)
      .getRepository(TestSession)
      .findOne({ where: { id: testSessionId } });
    expect(testSessionAfter).not.toBeNull();
    expect(testSessionAfter!.finishedAt).not.toBeNull();
    expect(testSessionAfter!.remainingTimeInSeconds).toBe(0);

    const testSessionResponseAfter = await requestTestAgent
      .get(`/students/test-sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const statusBody = testSessionResponseAfter.body.data;
    expect(statusBody).toBeDefined();
    expect(statusBody.id).toBe(testSessionId);
    expect(statusBody.levelFullName).toBe(level2!.fullName);
    expect(statusBody.story.id).toBe(level2!.stories[0].id);
    expect(statusBody.titleAtTaken).toBe(level2!.stories[0].title);
    expect(statusBody.imageAtTaken).toBe(level2!.stories[0].image);
    expect(statusBody.imageAtTakenUrl).toBe(
      level2!.stories[0].image
        ? `${process.env.APP_URL}${level2!.stories[0].image}`
        : null,
    );
    expect(statusBody.descriptionAtTaken).toBe(level2!.stories[0].description);
    expect(statusBody.passageAtTaken).toBe(level2!.stories[0].passage);
    expect(statusBody.passagesAtTaken).toStrictEqual(
      Story.passageToSentences(level2!.stories[0].passage),
    );
    expect(statusBody.finishedAt).not.toBeNull();
    expect(statusBody.remainingTimeInSeconds).toBe(0);
    expect(statusBody.medal).toBeNull();
    expect(statusBody.score).toBeNull();
    expect(statusBody.isCompleted).toBe(true);
  });

  it('POST /students/test-sessions/:id/stt-questions | must create STT questions for a valid test session', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    const sttResponse = await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const sttQuestions = sttResponse.body.data;
    expect(sttQuestions).toBeDefined();
    expect(Array.isArray(sttQuestions)).toBe(true);
    expect(sttQuestions.length).toBeGreaterThan(0);
  });

  it('POST /students/test-sessions/:id/stt-questions | must reject if test session is already finished', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Mark the test session as finished
    await app
      .get<DataSource>(DataSource)
      .getRepository(TestSession)
      .update(
        { id: testSessionId },
        {
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // started 3 hours ago
          finishedAt: new Date(),
        },
      );

    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('POST /students/test-sessions/:id/stt-questions | must reject if STT questions already started', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Start STT questions once
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    // Try to start again - should fail
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('POST /students/test-sessions/:id/stt-questions | must reject if not authenticated', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('POST /students/test-sessions/:id/stt-questions | must reject if test session not found', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    await requestTestAgent
      .post(`/students/test-sessions/TESTSESSION-nonexistent/stt-questions`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('GET /students/test-sessions/:id | must reject if student tries to access another student test session', async () => {
    // Student 2 creates a test session
    const student2SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const student2Token = student2SignInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Student 1 tries to access Student 2's test session
    const student1SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student1',
        password: '123456',
      })
      .expect(200);
    const student1Token = student1SignInResponse.body.data.token;

    // Should be rejected (404 since it doesn't belong to student1)
    await requestTestAgent
      .get(`/students/test-sessions/${testSessionId}`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(404);
  });

  it('GET /students/test-sessions/:id/status | must reject if student tries to access another student test session', async () => {
    // Student 2 creates a test session
    const student2SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const student2Token = student2SignInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Student 1 tries to access Student 2's test session status
    const student1SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student1',
        password: '123456',
      })
      .expect(200);
    const student1Token = student1SignInResponse.body.data.token;

    // Should be rejected (404 since it doesn't belong to student1)
    await requestTestAgent
      .get(`/students/test-sessions/${testSessionId}/status`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(404);
  });

  it('POST /students/test-sessions/:id/stt-questions | must reject if student tries to access another student test session', async () => {
    // Student 2 creates a test session
    const student2SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const student2Token = student2SignInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Student 1 tries to start STT questions on Student 2's test session
    const student1SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student1',
        password: '123456',
      })
      .expect(200);
    const student1Token = student1SignInResponse.body.data.token;

    // Should be rejected (404 since it doesn't belong to student1)
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/stt-questions`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(404);
  });

  it('POST /students/test-sessions/:id/finish | must successfully finish a valid test session', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    const finishResponse = await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const finishedSession = finishResponse.body.data;
    expect(finishedSession).toBeDefined();
    expect(finishedSession.id).toBe(testSessionId);
    expect(finishedSession.finishedAt).not.toBeNull();
    expect(finishedSession.isCompleted).toBe(true);
    expect(finishedSession.levelFullName).toBe(level2!.fullName);
    expect(finishedSession.story.id).toBe(level2!.stories[0].id);
  });

  it('POST /students/test-sessions/:id/finish | must reject if test session is already finished', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Finish the test session once
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Try to finish again - should fail
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('POST /students/test-sessions/:id/finish | must reject if test session not found', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    await requestTestAgent
      .post(`/students/test-sessions/TESTSESSION-nonexistent/finish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('POST /students/test-sessions/:id/finish | must reject if not authenticated', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('POST /students/test-sessions/:id/finish | must reject if student tries to finish another student test session', async () => {
    // Student 2 creates a test session
    const student2SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const student2Token = student2SignInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Student 1 tries to finish Student 2's test session
    const student1SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student1',
        password: '123456',
      })
      .expect(200);
    const student1Token = student1SignInResponse.body.data.token;

    // Should be rejected (404 since it doesn't belong to student1)
    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${student1Token}`)
      .expect(404);
  });

  it('POST /students/test-sessions/:id/finish | must finish test session even if time has expired', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Mark the test session as started 3 hours ago (time expired)
    await app
      .get<DataSource>(DataSource)
      .getRepository(TestSession)
      .update(
        { id: testSessionId },
        {
          startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // started 3 hours ago
        },
      );

    // Should still be able to finish
    const finishResponse = await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const finishedSession = finishResponse.body.data;
    expect(finishedSession).toBeDefined();
    expect(finishedSession.id).toBe(testSessionId);
    expect(finishedSession.finishedAt).not.toBeNull();
    expect(finishedSession.isCompleted).toBe(true);
    expect(finishedSession.remainingTimeInSeconds).toBe(0);
  });

  it('POST /students/test-sessions/:id/finish | must reject if user is not a student', async () => {
    // Create a test session first with student2
    const student2SignInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student2',
        password: '123456',
      })
      .expect(200);
    const student2Token = student2SignInResponse.body.data.token;

    // to populate the level progresses
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(200);

    const level2: Level | null = await app
      .get<DataSource>(DataSource)
      .getRepository(Level)
      .findOne({
        where: { no: 2 },
        relations: ['stories'],
      });
    expect(level2).not.toBeNull();

    const response = await requestTestAgent
      .post(`/students/test-sessions`)
      .send({
        storyId: level2!.stories[0].id,
      })
      .set('Authorization', `Bearer ${student2Token}`)
      .expect(201);

    const testSessionId = response.body.data.id;

    // Teacher tries to finish the test session
    const teacherSignInResponse = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'teacher1password',
      })
      .expect(200);
    const teacherToken = teacherSignInResponse.body.data.token;

    await requestTestAgent
      .post(`/students/test-sessions/${testSessionId}/finish`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(403);
  });
});
