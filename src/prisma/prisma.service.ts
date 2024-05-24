import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {

    async cleanDatabase() {
        // ignore if 'production' environment
        if (process.env.NODE_ENV === 'production') return;
        // if not delete all db models
        const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
        return Promise.all(models.map((modelKey) => {
            try{
                this[modelKey].deleteMany()
            } catch(error) {
                // do nothing for non models
            }
        }));
    }
}
