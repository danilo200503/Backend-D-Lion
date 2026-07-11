import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';


async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const configService = app.get(AppConfigService);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  
  
  
  
  const origensPermitidas = configService.allowedOrigins;
  app.enableCors({
    origin: configService.isProduction && origensPermitidas.length > 0 ? origensPermitidas : true,
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  app.useGlobalInterceptors(new LoggingInterceptor(logger), new ResponseTransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('D-Lion API')
    .setDescription('API do sistema SaaS D-Lion para escritórios de contabilidade')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(configService.port);
  logger.log(`D-Lion backend rodando na porta ${configService.port}`, 'Bootstrap');
  logger.log('Documentação Swagger disponível em /api/docs', 'Bootstrap');
}

bootstrap();
