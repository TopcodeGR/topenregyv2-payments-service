import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { GlobalExceptionsFilter } from './filters/globalExceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.connectMicroservice(
    {
      transport: Transport.REDIS,
      options: {
        host: process.env["REDIS_HOST"],
        port: Number(process.env["REDIS_PORT"]) || 6380,
      },
    },
    {
      inheritAppConfig: true,
    },
  );
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionsFilter())
  await app.startAllMicroservices();
  await app.listen(process.env['PORT'] || 5001);
}

bootstrap();
