import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { updateGlobalConfig } from 'nestjs-paginate';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')

  app.enableVersioning({  // กำหนด version
    type: VersioningType.URI,
    defaultVersion: '1'
  })
  app.use(cookieParser())  // เก็บ refresh token ไว้ใน cookie

  updateGlobalConfig({ // pagination
    defaultLimit:10,   // 10 record for 1 page
  })

  app.useGlobalPipes(new ZodValidationPipe());


  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
