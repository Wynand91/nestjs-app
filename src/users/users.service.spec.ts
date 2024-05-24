import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient> ();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock
        }
      ],
      imports: [PrismaModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSingleUser', () => {
    it('should return a single user', async() => {
      const date = new Date();
      const user = {
        id: 1,
        email: 'john@email.com',
        name: 'John',
        password: '12391jasdj123',
        createdAt: date,
        updatedAt: date
      }
      prismaMock.user.findUnique.mockResolvedValue(user)

      const result = await service.findOne(user.id);
      expect(result).toEqual(user);
    });
  });

  // describe('getAllUsers', () => {
  //   it('should return all users', async () => {
  //     const users = [
  //       {
  //         username: 'john@email.com',
  //         name: 'John',
  //       },
  //       {
  //         username: 'daisy@email.com',
  //         name: 'Daisy',
  //       }
  //     ];

  //     const result = await service.findAll();
  //     expect(result).toEqual(users);
  //   })
  // });
});
