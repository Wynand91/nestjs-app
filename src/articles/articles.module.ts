import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsModule } from 'src/events/events.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [
    PrismaModule, 
    EventsModule
  ],
})
export class ArticlesModule {}
