import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from '../prisma/prisma.service';
import { APIFeatures } from '../apiFeatures';
import { EventsGateway } from '../events/events.gateway';
import { Article } from '@prisma/client';


@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService, 
    private eventGateway: EventsGateway
  ) {}

  // CRUD operations
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createArticle = await this.prisma.article.create({ 
      data: createArticleDto
    });

    // comment out for integration testing - probably needs to be
    // this.eventGateway.sendNewArticleMessage(createArticle)

    return createArticle;
  }

  findDrafts() {
    return this.prisma.article.findMany({ where: { published: false } });
  }

  async findAll(query?: any, searchFields?: any) {
    const qs = this.prisma.article
    const defaultParams = { published: true }
    const features = new APIFeatures(qs, query, searchFields, defaultParams)
    features.execute();
    return await features.prismaQuery
  }

  findOne(id: number) {
    return this.prisma.article.findUnique({ 
      where: { id },
      include: { author: true },  // include serialized author
    });
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  remove(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }

  

}
