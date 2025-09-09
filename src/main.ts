import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS más específica para el frontend Angular
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev server
      'http://localhost:4201', // Angular alternate port
      'http://localhost:3000', // Backend port (para pruebas)
      'https://gestion-360-ph.web.app', // Firebase hosting
      'https://gestion-360-ph.firebaseapp.com', // Firebase hosting alternate
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 3600,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Gestion360PH API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'firebase-auth', // Este nombre es importante
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Puerto
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  // Logs informativos
  console.log(`\n🚀 App corriendo en: http://localhost:${port}`);
  console.log(`📚 Swagger disponible en: http://localhost:${port}/swagger`);
}
bootstrap();
