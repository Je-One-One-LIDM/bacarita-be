// filepath: test/e2e/users/teacher-get-student-levels.e2e-spec.ts
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { MailService } from 'src/common/mail/mail.service';
import { TokenGeneratorService } from 'src/common/token-generator/token-generator.service';
import { LevelSeeder } from 'src/database/seeders/level.seeder';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../../utils/create-testing-app.utils';
import { clearDatabase } from '../../../utils/testing-database.utils';

describe('Student Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;
  let tokenGeneratorService: TokenGeneratorService;
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

    randomUUIDV7.mockReset();
    randomNumericCode.mockReset();

    const levelSeeder: LevelSeeder = new LevelSeeder(
      app.get<DataSource>(DataSource),
    );
    await levelSeeder.run();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // none
  });

  it('GET /students/levels | must return student levels and its correct data', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/students/login')
      .send({
        username: 'student1',
        password: '123456',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    const response = await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = response.body.data;
    expect(body).toBeDefined();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].stories.length).toBe(2);

    const level1 = body[0];
    expect(level1.no).toBe(1);
    expect(level1.name).toBe('Lala dan Balon Merah');
    expect(level1.fullName).toBe('Level 1. Lala dan Balon Merah');
    expect(level1.isBonusLevel).toBe(false);
    expect(level1.maxPoints).toBe(6);
    expect(level1.isUnlocked).toBe(true);
    expect(level1.requiredPoints).toBe(5);
    expect(level1.goldCount).toBe(0);
    expect(level1.silverCount).toBe(0);
    expect(level1.bronzeCount).toBe(0);
    expect(level1.progress).toBe(0);

    const story1_level1 = level1.stories[0];
    expect(story1_level1).toBeDefined();
    expect(story1_level1.title).toBe('Lala dan Balon Merah');
    expect(story1_level1.imageUrl).toBe(
      `${process.env.APP_URL}/public/placeholder.webp`,
    );
    expect(story1_level1.isGoldMedal).toBe(false);
    expect(story1_level1.isSilverMedal).toBe(false);
    expect(story1_level1.isBronzeMedal).toBe(false);
    const story2_level1 = level1.stories[1];
    expect(story2_level1).toBeDefined();
    expect(story2_level1.title).toBe('Lala dan Balon Merah 2');
    expect(story2_level1.imageUrl).toBeNull();
    expect(story2_level1.isGoldMedal).toBe(false);
    expect(story2_level1.isSilverMedal).toBe(false);
    expect(story2_level1.isBronzeMedal).toBe(false);
  });

  it('GET /students/levels | must reject if user is not a student', async () => {
    const signInResponse = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'teacher1password',
      })
      .expect(200);
    const token = signInResponse.body.data.token;

    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /students/levels | must reject if token is invalid', async () => {
    await requestTestAgent
      .get('/students/levels')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /students/levels | must reject if token is missing', async () => {
    await requestTestAgent.get('/students/levels').expect(401);
  });
});
