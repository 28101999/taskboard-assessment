import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const usersMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };
  const jwtMock = { sign: jest.fn(() => 'token') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user', async () => {
    usersMock.findByEmail.mockResolvedValue(null);
    usersMock.create.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash' });

    const result = await service.register({ email: 'test@test.com', password: 'pass123' });
    expect(result.email).toBe('test@test.com');
  });

  it('should throw conflict on duplicate email', async () => {
    usersMock.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' });
    await expect(service.register({ email: 'test@test.com', password: 'pass123' }))
      .rejects
      .toThrow(ConflictException);
  });

  it('should login a valid user', async () => {
    const passwordHash = await bcrypt.hash('pass123', 10);
    usersMock.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash });
    const result = await service.login({ email: 'test@test.com', password: 'pass123' });
    expect(result.accessToken).toBe('token');
  });

  it('should throw Unauthorized for invalid login', async () => {
    usersMock.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'wrong@test.com', password: 'pass123' }))
      .rejects
      .toThrow(UnauthorizedException);
  });
});
