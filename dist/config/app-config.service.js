"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get port() {
        return this.configService.get('PORT', 3000);
    }
    get nodeEnv() {
        return this.configService.get('NODE_ENV', 'development');
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get databaseUrl() {
        return this.getOrThrow('DATABASE_URL');
    }
    get jwtSecret() {
        return this.getOrThrow('JWT_SECRET');
    }
    get jwtExpiresIn() {
        return this.getOrThrow('JWT_EXPIRES_IN');
    }
    get jwtRefreshSecret() {
        return this.getOrThrow('JWT_REFRESH_SECRET');
    }
    get jwtRefreshExpiresIn() {
        return this.getOrThrow('JWT_REFRESH_EXPIRES_IN');
    }
    get openAiApiKey() {
        return this.configService.get('OPENAI_API_KEY');
    }
    get whatsappToken() {
        return this.configService.get('WHATSAPP_TOKEN');
    }
    get whatsappApiUrl() {
        return this.configService.get('WHATSAPP_API_URL');
    }
    get whatsappPhoneId() {
        return this.configService.get('WHATSAPP_PHONE_ID');
    }
    get redisUrl() {
        return this.configService.get('REDIS_URL');
    }
    get smtpHost() {
        return this.configService.get('SMTP_HOST');
    }
    get smtpPort() {
        return this.configService.get('SMTP_PORT', 587);
    }
    get smtpUser() {
        return this.configService.get('SMTP_USER');
    }
    get smtpPass() {
        return this.configService.get('SMTP_PASS');
    }
    get smtpFrom() {
        return this.configService.get('SMTP_FROM', 'D-LION <naoresponda@d-lion.com.br>');
    }
    get smtpSecure() {
        return this.configService.get('SMTP_SECURE', 'false') === 'true';
    }
    get smtpConfigured() {
        return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
    }
    get allowedOrigins() {
        const raw = this.configService.get('ALLOWED_ORIGINS', '');
        return raw
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
    }
    get frontendUrl() {
        return this.configService.get('FRONTEND_URL', 'http://localhost:4200');
    }
    get googleClientId() {
        return this.configService.get('GOOGLE_CLIENT_ID');
    }
    get googleClientSecret() {
        return this.configService.get('GOOGLE_CLIENT_SECRET');
    }
    get googleCallbackUrl() {
        return this.configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:3001/api/v1/auth/google/callback');
    }
    get googleConfigured() {
        return Boolean(this.googleClientId && this.googleClientSecret);
    }
    getOrThrow(key) {
        const value = this.configService.get(key);
        if (!value) {
            throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
        }
        return value;
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map