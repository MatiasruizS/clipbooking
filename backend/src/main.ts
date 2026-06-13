import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : true, // en dev permite cualquier origen (IP local, localhost, celular)
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`ClipBooking API corriendo en puerto ${process.env.PORT ?? 3000}`);
}
bootstrap();
