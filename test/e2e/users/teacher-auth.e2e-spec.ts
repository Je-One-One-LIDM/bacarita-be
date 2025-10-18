/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { Teacher } from 'src/feature/users/entities/teacher.entity';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import createTestingApp from '../../utils/create-testing-app.utils';
import { clearDatabase } from '../../utils/testing-database.utils';

describe('Teacher Auth (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestingApp();
    requestTestAgent = request(app.getHttpServer());
    dataSource = app.get<DataSource>(DataSource);
  }, 15000);

  beforeEach(async () => {
    await clearDatabase(app);
    // Create a test teacher for login tests
    await requestTestAgent.post('/teachers').send({
      email: 'teacher1@gmail.com',
      username: 'teacher1',
      password: 'teacher1password',
      confirmPassword: 'teacher1password',
      fullName: 'Teacher One',
      schoolName: 'School Name 1',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // none
  });

  it('POST /auth/teachers/login | must sign in with email if credentials are valid', async () => {
    const response = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'teacher1password',
      })
      .expect(200);

    const body = response.body.data;
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('username');
    expect(body).not.toHaveProperty('fullName');
    expect(body).not.toHaveProperty('password');
    expect(body).toHaveProperty('token');

    // Verify token is saved in database
    const teacherInDb: Teacher | null = await dataSource
      .getRepository(Teacher)
      .findOneBy({ email: 'teacher1@gmail.com' });
    expect(teacherInDb).toBeDefined();
    expect(teacherInDb!.token).toBe(body.token);
  });

  it('POST /auth/teachers/login | must sign in with username if credentials are valid', async () => {
    const response = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        username: 'teacher1',
        password: 'teacher1password',
      })
      .expect(200);

    const body = response.body.data;
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('username');
    expect(body).not.toHaveProperty('fullName');
    expect(body).not.toHaveProperty('password');
    expect(body).toHaveProperty('token');

    // Verify token is saved in database
    const teacherInDb: Teacher | null = await dataSource
      .getRepository(Teacher)
      .findOneBy({ email: 'teacher1@gmail.com' });
    expect(teacherInDb).toBeDefined();
    expect(teacherInDb!.token).toBe(body.token);
  });

  it('POST /auth/teachers/login | must reject if email is invalid', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'invalid@gmail.com',
        password: 'teacher1password',
      })
      .expect(401);
  });

  it('POST /auth/teachers/login | must reject if username is invalid', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        username: 'invaliduser',
        password: 'teacher1password',
      })
      .expect(401);
  });

  it('POST /auth/teachers/login | must reject if password is wrong', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('POST /auth/teachers/login | must reject if neither email nor username provided', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        password: 'teacher1password',
      })
      .expect(400);
  });

  it('POST /auth/teachers/login | must reject if password is missing', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
      })
      .expect(400);
  });

  it('POST /auth/teachers/login | must reject if request body is empty', async () => {
    await requestTestAgent.post('/auth/teachers/login').send({}).expect(400);
  });

  it('POST /auth/teachers/login | must reject if email format is invalid', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'invalid-email',
        password: 'teacher1password',
      })
      .expect(400);
  });

  it('POST /auth/teachers/login | must reject if username contains invalid characters', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        username: 'teacher@123',
        password: 'teacher1password',
      })
      .expect(400);
  });

  it('POST /auth/teachers/login | must reject if username and email are both there provided', async () => {
    await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        username: 'teacher1',
        password: 'teacher1password',
      })
      .expect(403);
  });

  it('POST /auth/teachers/logout | must sign out successfully', async () => {
    // First sign in
    const signInResponse = await requestTestAgent
      .post('/auth/teachers/login')
      .send({
        email: 'teacher1@gmail.com',
        password: 'teacher1password',
      })
      .expect(200);

    const token = signInResponse.body.data.token;

    // Then sign out
    await requestTestAgent
      .post('/auth/teachers/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Verify token is cleared from database
    const teacherInDb: Teacher | null = await dataSource
      .getRepository(Teacher)
      .findOneBy({ email: 'teacher1@gmail.com' });
    expect(teacherInDb).toBeDefined();
    expect(teacherInDb!.token).toBeNull();
  });

  it('POST /auth/teachers/logout | must reject if token is invalid', async () => {
    await requestTestAgent
      .post('/auth/teachers/logout')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('POST /auth/teachers/logout | must reject if token is missing', async () => {
    await requestTestAgent.post('/auth/teachers/logout').expect(401);
  });
});
