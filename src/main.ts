import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { updateGlobalConfig } from 'nestjs-paginate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })
  app.use(cookieParser())

  updateGlobalConfig({
    defaultLimit:10,
  })


  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
