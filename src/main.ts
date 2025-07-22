import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

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
