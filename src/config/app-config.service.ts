import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get databaseUrl(): string {
    return this.getOrThrow('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.getOrThrow('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.getOrThrow('JWT_EXPIRES_IN');
  }

  get jwtRefreshSecret(): string {
    return this.getOrThrow('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn(): string {
    return this.getOrThrow('JWT_REFRESH_EXPIRES_IN');
  }

  get openAiApiKey(): string | undefined {
    return this.configService.get<string>('OPENAI_API_KEY');
  }

  get whatsappToken(): string | undefined {
    return this.configService.get<string>('WHATSAPP_TOKEN');
  }

  get whatsappApiUrl(): string | undefined {
    return this.configService.get<string>('WHATSAPP_API_URL');
  }

  get whatsappPhoneId(): string | undefined {
    return this.configService.get<string>('WHATSAPP_PHONE_ID');
  }

  get redisUrl(): string | undefined {
    return this.configService.get<string>('REDIS_URL');
  }

  
  get smtpHost(): string | undefined {
    return this.configService.get<string>('SMTP_HOST');
  }

  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT', 587);
  }

  get smtpUser(): string | undefined {
    return this.configService.get<string>('SMTP_USER');
  }

  get smtpPass(): string | undefined {
    return this.configService.get<string>('SMTP_PASS');
  }

  get smtpFrom(): string {
    return this.configService.get<string>('SMTP_FROM', 'D-LION <naoresponda@d-lion.com.br>');
  }

  get smtpSecure(): boolean {
    return this.configService.get<string>('SMTP_SECURE', 'false') === 'true';
  }

  
  get smtpConfigured(): boolean {
    return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
  }

  
  
  get allowedOrigins(): string[] {
    const raw = this.configService.get<string>('ALLOWED_ORIGINS', '');
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
  }

  get googleClientId(): string | undefined {
    return this.configService.get<string>('GOOGLE_CLIENT_ID');
  }

  get googleClientSecret(): string | undefined {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  }

  get googleCallbackUrl(): string {
    return this.configService.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3001/api/v1/auth/google/callback',
    );
  }

  get googleConfigured(): boolean {
    return Boolean(this.googleClientId && this.googleClientSecret);
  }

  get anthropicApiKey(): string | undefined {
    return this.configService.get<string>('ANTHROPIC_API_KEY');
  }

  get anthropicConfigured(): boolean {
    return Boolean(this.anthropicApiKey);
  }

  get limiteMensagensIaPorPlano(): number {
    return this.configService.get<number>('LIMITE_MENSAGENS_IA_MES', 30);
  }

  
  private getOrThrow(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
    }
    return value;
  }
}
