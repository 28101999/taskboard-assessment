import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'newuser@local.com', password: 'test123' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'newuser@local.com');
  });

  it('logs in and returns access token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'login@local.com', password: 'test123' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@local.com', password: 'test123' })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
  });

  it('rejects invalid login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@local.com', password: 'nope' })
      .expect(401);

    expect(res.body.message).toBeDefined();
  });
});
