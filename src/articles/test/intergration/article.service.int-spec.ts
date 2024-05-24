import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { ArticlesService } from "src/articles/articles.service";
import { CreateArticleDto } from "src/articles/dto/create-article.dto";
import { PrismaService } from "src/prisma/prisma.service";

describe('ArticleService Int', () => {
    let prisma: PrismaService;
    let articleService: ArticlesService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        prisma = moduleRef.get(PrismaService)
        
        articleService = moduleRef.get(ArticlesService)
        await prisma.cleanDatabase()
    });

    describe('createArticle', () => {
        let userId: number;
        const dto: CreateArticleDto = {
            title: 'This is a test article',
            description: 'This article will be used in integration test',
            body: 'This article is being used in integration test',
            published: true,
        }
        it('should create user', async () => {
            const user = await prisma.user.create({
                data: {
                    name: 'John',
                    email: 'john@test.com',
                    password: '123test'
                }
            });

            userId = user.id

        });

        it('should create article', async () => {
            const article = await articleService.create(dto)
            expect(article.title).toBe(dto.title)
            expect(article.description).toBe(dto.description)
            
        })

        it('should throw error on duplicate title', async () => {
            await articleService.create(dto)
                .catch(error => expect(error.code).toBe('P2002')); 
        })
    });

    describe('updateArticle', () => {});
})