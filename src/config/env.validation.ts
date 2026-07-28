import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, MinLength, validateSync } from 'class-validator';


enum Ambiente {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}


class EnvironmentVariables {
  @IsOptional()
  @IsIn([Ambiente.Development, Ambiente.Production, Ambiente.Test])
  NODE_ENV: Ambiente = Ambiente.Development;

  @IsOptional()
  @IsNumber()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(8)
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  @MinLength(8)
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  WHATSAPP_TOKEN?: string;

  @IsOptional()
  @IsString()
  WHATSAPP_API_URL?: string;

  @IsOptional()
  @IsString()
  WHATSAPP_PHONE_ID?: string;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  
  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  SMTP_FROM?: string;

  @IsOptional()
  @IsString()
  SMTP_SECURE?: string;

  
  
  
  @IsOptional()
  @IsString()
  ALLOWED_ORIGINS?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  ANTHROPIC_API_KEY?: string;

  @IsOptional()
  @IsNumber()
  LIMITE_MENSAGENS_IA_MES?: number;
}


export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuração de ambiente inválida: ${errors.toString()}`);
  }

  return validatedConfig;
}
