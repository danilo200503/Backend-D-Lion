declare enum Ambiente {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Ambiente;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    OPENAI_API_KEY?: string;
    WHATSAPP_TOKEN?: string;
    WHATSAPP_API_URL?: string;
    WHATSAPP_PHONE_ID?: string;
    REDIS_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: number;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    SMTP_SECURE?: string;
    ALLOWED_ORIGINS?: string;
    FRONTEND_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
