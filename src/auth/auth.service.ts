import { Inject, Injectable, LoggerService, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { UserWithRoles } from '../users/interfaces/user-with-roles.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, TokenPair } from './interfaces/jwt-payload.interface';

const REFRESH_TOKEN_EXPIRATION_MAP: Record<string, number> = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
};


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly emailService: EmailService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const usuario = await this.usersService.create(dto);
    this.logger.log(`Novo usuário cadastrado: ${usuario.email}`, 'AuthService');

    if (usuario.tokenVerificacaoEmail) {
      this.emailService
        .enviarVerificacaoEmail(usuario.email, usuario.nome, usuario.tokenVerificacaoEmail)
        .catch((erro: Error) =>
          this.logger.warn(`Falha ao enviar e-mail de verificação para ${usuario.email}: ${erro.message}`),
        );
    }

    return { email: usuario.email, emailVerificado: usuario.emailVerificado };
  }

  async verificarEmail(token: string): Promise<AuthResponseDto> {
    const usuario = await this.usersService.verificarEmail(token);
    this.logger.log(`E-mail verificado: ${usuario.email}`, 'AuthService');
    return this.gerarRespostaAutenticacao(usuario);
  }

  async reenviarVerificacao(email: string): Promise<void> {
    const usuario = await this.usersService.gerarNovoTokenVerificacao(email);
    if (usuario.tokenVerificacaoEmail) {
      this.emailService
        .enviarVerificacaoEmail(usuario.email, usuario.nome, usuario.tokenVerificacaoEmail)
        .catch((erro: Error) =>
          this.logger.warn(`Falha ao reenviar e-mail de verificação para ${usuario.email}: ${erro.message}`),
        );
    }
  }

  async esqueciSenha(email: string): Promise<void> {
    const usuario = await this.usersService.gerarTokenResetSenha(email);
    if (usuario && usuario.tokenResetSenha) {
      this.emailService
        .enviarRedefinicaoSenha(usuario.email, usuario.nome, usuario.tokenResetSenha)
        .catch((erro: Error) =>
          this.logger.warn(`Falha ao enviar e-mail de redefinição de senha para ${usuario.email}: ${erro.message}`),
        );
    }
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    await this.usersService.redefinirSenhaComToken(token, novaSenha);
  }

  async loginComGoogle(dados: { email: string; nome: string }): Promise<AuthResponseDto> {
    const usuario = await this.usersService.encontrarOuCriarComGoogle(dados);
    await this.usersService.atualizarUltimoLogin(usuario.id);
    this.logger.log(`Login com Google: ${usuario.email}`, 'AuthService');
    return this.gerarRespostaAutenticacao(usuario);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usersService.findByEmail(dto.email);

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (!usuario.emailVerificado) {
      throw new UnauthorizedException(
        'Seu e-mail ainda não foi verificado. Confira sua caixa de entrada ou solicite um novo link de verificação.',
      );
    }

    await this.usersService.atualizarUltimoLogin(usuario.id);
    this.logger.log(`Login realizado: ${usuario.email}`, 'AuthService');

    return this.gerarRespostaAutenticacao(usuario);
  }

  
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenArmazenado = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenArmazenado || tokenArmazenado.revoked || tokenArmazenado.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenArmazenado.id },
      data: { revoked: true },
    });

    const usuario = await this.usersService.findById(tokenArmazenado.userId);
    this.logger.log(`Refresh token renovado: ${usuario.email}`, 'AuthService');

    return this.gerarRespostaAutenticacao(usuario);
  }

  
  async logout(refreshToken: string): Promise<void> {
    const tokenArmazenado = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenArmazenado) {
      return;
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenArmazenado.id },
      data: { revoked: true },
    });

    this.logger.log(`Logout realizado para userId: ${tokenArmazenado.userId}`, 'AuthService');
  }

  
  private async gerarRespostaAutenticacao(usuario: UserWithRoles): Promise<AuthResponseDto> {
    const roles = usuario.userRoles.map((userRole) => userRole.role.nome);
    const tokens = await this.gerarTokens(usuario.id, usuario.email, roles);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        company: {
          id: usuario.company.id,
          name: usuario.company.name,
          cnpj: usuario.company.cnpj,
        },
        permissoes: roles,
      },
    };
  }

  
  private async gerarTokens(userId: string, email: string, roles: string[]): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtExpiresIn as SignOptions['expiresIn'],
    });

    const refreshTokenValue = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: this.configService.jwtRefreshExpiresIn as SignOptions['expiresIn'],
      },
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpirationToMs(this.configService.jwtRefreshExpiresIn),
    );

    await this.prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshTokenValue,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  
  private parseExpirationToMs(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
    if (!match) {
      return REFRESH_TOKEN_EXPIRATION_MAP.d * 7;
    }
    const [, quantidade, unidade] = match;
    return Number(quantidade) * REFRESH_TOKEN_EXPIRATION_MAP[unidade];
  }
}
