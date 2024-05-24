import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';
import { ArticlesController } from './articles.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';


const articleArray = [
  {'title': 'some title', 'description': 'description', 'body': 'blah blah', 'published': true},
  {'title': 'some title 1', 'description': 'description 1', 'body': 'blah blah', 'published': true},
  {'title': 'some title 2', 'description': 'description 2', 'body': 'blah blah', 'published': false},
]

const oneArticle = articleArray[0];

const db = {
  article: {
    findMany: jest.fn().mockResolvedValue(articleArray),
    findUnique: jest.fn().mockResolvedValue(oneArticle),
  },
};

// 'describe' annotation is used to group related test cases and provide a description of what the group of tests is intended to test
describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
      imports: [
        PrismaModule, 
        EventsModule
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      const articles = await service.findOne(1);
      expect(articles).toEqual(oneArticle)
    })
  });
});
