"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const path_1 = require("path");
const nest_winston_1 = require("nest-winston");
const app_module_1 = require("./app.module");
const app_config_service_1 = require("./config/app-config.service");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_transform_interceptor_1 = require("./common/interceptors/response-transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);
    const configService = app.get(app_config_service_1.AppConfigService);
    app.setGlobalPrefix('api/v1');
    app.use((0, helmet_1.default)());
    const origensPermitidas = configService.allowedOrigins;
    app.enableCors({
        origin: configService.isProduction && origensPermitidas.length > 0 ? origensPermitidas : true,
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter(logger));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(logger), new response_transform_interceptor_1.ResponseTransformInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('D-Lion API')
        .setDescription('API do sistema SaaS D-Lion para escritórios de contabilidade')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, swaggerDocument, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(configService.port);
    logger.log(`D-Lion backend rodando na porta ${configService.port}`, 'Bootstrap');
    logger.log('Documentação Swagger disponível em /api/docs', 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map