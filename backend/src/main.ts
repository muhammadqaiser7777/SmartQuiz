import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import this

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ADD THIS LINE ---
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // Strips out any properties not in the DTO
    forbidNonWhitelisted: true, // Throws error if extra properties are sent
    transform: true,         // Automatically transforms types
  }));
  // ---------------------

  app.enableCors({
    origin: ['http://localhost:2002', 'http://localhost:2005'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 2001);
}
bootstrap();