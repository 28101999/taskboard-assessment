import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Todos E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Register + login demo user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@local.com', password: 'test123' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@local.com', password: 'test123' });

    token = res.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('creates a todo', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Todo' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('New Todo');
  });
});
