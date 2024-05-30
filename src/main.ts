import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // whitelist means that any proporties on DTO, without validation decorators, will be ignored.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Interceptors in NestJS allow you to hook into the request-response cycle and allow you to execute extra logic before and after the route handler is executed
  // can also bind interceptor to a method or controller, instead of globally like this: https://docs.nestjs.com/interceptors#binding-interceptors
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  app.enableCors({origin: '*', methods: ['GET', 'POST']})

  // run server
  await app.listen(8000);
}
bootstrap();
