import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { createCorsOriginValidator } from './common/utils/cors-origin.util';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.use(helmet());
  app.use(cookieParser());

  const extraOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedDomain = process.env.CORS_ALLOWED_DOMAIN ?? 'danielsimas.com.br';

  app.enableCors({
    origin: createCorsOriginValidator({
      allowedDomain,
      extraOrigins,
      production: process.env.NODE_ENV === 'production',
    }),
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
