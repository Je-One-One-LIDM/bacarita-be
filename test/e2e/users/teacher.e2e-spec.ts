/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { App } from 'supertest/types';
import createTestingApp from '../../utils/create-testing-app.utils';
import { dropDatabase } from '../../utils/testing-database.utils';

describe('Teachers (e2e)', () => {
  let app: INestApplication<App>;
  let requestTestAgent: TestAgent;

  beforeAll(async () => {
    await dropDatabase();
    app = await createTestingApp();
    requestTestAgent = request(app.getHttpServer());
  });

  beforeEach(async () => {
    // none
  });

  afterEach(async () => {
    await app.close();
    await dropDatabase();
  });

  afterAll(async () => {
    // none
  });

  it('POST /teachers | must register an user if request body is valid', () => {
    return requestTestAgent
      .post('/teachers')
      .send({
        email: 'teacher1@gmail.com',
        username: 'teacher1',
        password: 'teacher1password',
        fullName: 'Teacher One',
        schoolName: 'School Name 1',
      })
      .expect(201)
      .then((response) => {
        response.body.should.have.property('id');
        response.body.should.have.property('email', 'teacher1@gmail.com');
        response.body.should.have.property('username', 'teacher1');
        response.body.should.have.property('fullName', 'Teacher One');
        response.body.should.not.have.property('password');
        response.body.should.not.have.property('token');
        response.body.should.have.property('schoolName', 'School Name 1');
        response.body.should.have.property('createdAt');
        response.body.should.have.property('updatedAt');
      });
  });

  it('POST /teachers | must reject if request body is empty', () => {
    return requestTestAgent
      .post('/teachers')
      .send({
        email: '',
        username: '',
        password: '',
        fullName: '',
        schoolName: '',
      })
      .expect(400);
  });

  it('POST /teachers | must reject if fields is missing', () => {
    return requestTestAgent.post('/teachers').send({}).expect(400);
  });
});
