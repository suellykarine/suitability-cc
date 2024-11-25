import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Credit Connect API')
    .setVersion('0.1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const allowedOrigins = process.env.ALLOWED_URL.split(',');
  app.enableCors({
    origin: [...allowedOrigins],
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000);

  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
  console.log(`Utilizando a variável .env.${process.env.AMBIENTE}`);
}
bootstrap();
