import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from '../../todos/todos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, PrismaService],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate todo title length', async () => {
    await expect(
      service.create({
        title: 'x'.repeat(300),
        description: 'invalid',
      }, 'user-id'),
    ).rejects.toThrow();
  });
});
