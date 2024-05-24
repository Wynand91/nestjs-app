import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, NotFoundException, Query, Res, Req } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ArticleEntity } from './entities/article.entity';
import { response } from 'express';

@Controller('articles')
@ApiTags('articles')  // groups all endpoints together on swagger docs
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}
  //  default routes: Automatically created by running `npx nest generate resource` (also creates services)
  @Post()
  @ApiCreatedResponse({ type: ArticleEntity })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return new ArticleEntity(
      await this.articlesService.create(createArticleDto),
    );
  }

  // @Get()
  // @ApiQuery({ name: 'search', required: false, type: String })
  // @ApiOkResponse({ type: ArticleEntity, isArray: true })
  // async findAll(@Query('search') search?: string) {
  //   const articles = await this.articlesService.findAll(search);
  //   return articles.map((article) => new ArticleEntity(article));
  // }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiOkResponse({ type: ArticleEntity, isArray: true })
  async findAll(@Req() request: any) {
    const searchFields = ['title']
    const articles = await this.articlesService.findAll(request.query, searchFields);
    return await articles.map((article) => new ArticleEntity(article));
  }

  // custom route (create manually)
  @Get('drafts')
  @ApiOkResponse({ type: ArticleEntity, isArray: true })
  async findDrafts() {
    const drafts = await this.articlesService.findDrafts();
    return drafts.map((draft) => new ArticleEntity(draft));
  }

  // param is passed to controller as a str. ParseIntPipe will intercept the value and change it to a number.
  @Get(':id')
  @ApiOkResponse({ type: ArticleEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const article = await this.articlesService.findOne(id);
    if (!article) {
      throw new NotFoundException(`Article with ${id} does not exist.`)
    }
    return new ArticleEntity(article)
  }

  @Patch(':id')
  @ApiOkResponse({ type: ArticleEntity })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return new ArticleEntity( 
      await this.articlesService.update(id, updateArticleDto)
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: ArticleEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return new ArticleEntity(
      await this.articlesService.remove(id)
    );
  }
}
