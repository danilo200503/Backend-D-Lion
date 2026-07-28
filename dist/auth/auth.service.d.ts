import { LoggerService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly emailService;
    private readonly logger;
    constructor(usersService: UsersService, prisma: PrismaService, jwtService: JwtService, configService: AppConfigService, emailService: EmailService, logger: LoggerService);
    register(dto: RegisterDto): Promise<RegisterResponseDto>;
    verificarEmail(token: string): Promise<AuthResponseDto>;
    reenviarVerificacao(email: string): Promise<void>;
    esqueciSenha(email: string): Promise<void>;
    redefinirSenha(token: string, novaSenha: string): Promise<void>;
    loginComGoogle(dados: {
        email: string;
        nome: string;
    }): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(refreshToken: string): Promise<void>;
    private gerarRespostaAutenticacao;
    private gerarTokens;
    private parseExpirationToMs;
}
