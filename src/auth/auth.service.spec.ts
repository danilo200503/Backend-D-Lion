import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; atualizarUltimoLogin: jest.Mock; findById: jest.Mock };
  let prisma: { refreshToken: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  const usuarioMock = {
    id: 'user-1',
    nome: 'Usuário Teste',
    email: 'teste@dlion.com.br',
    company: { id: 'company-1', name: 'Empresa Teste', cnpj: '00.000.000/0001-00' },
    ativo: true,
    userRoles: [{ role: { nome: 'Cliente' } }],
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      atualizarUltimoLogin: jest.fn(),
      findById: jest.fn(),
    };
    prisma = {
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('token-assinado'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: AppConfigService,
          useValue: {
            jwtSecret: 'segredo',
            jwtExpiresIn: '15m',
            jwtRefreshSecret: 'segredo-refresh',
            jwtRefreshExpiresIn: '7d',
          },
        },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('deve lançar UnauthorizedException se o usuário não existir', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inexistente@teste.com', senha: 'Senha@123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      const senhaHash = await bcrypt.hash('SenhaCorreta@123', 12);
      usersService.findByEmail.mockResolvedValue({ ...usuarioMock, senhaHash });

      await expect(
        service.login({ email: usuarioMock.email, senha: 'SenhaErrada@123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deve autenticar com sucesso e retornar os tokens', async () => {
      const senhaHash = await bcrypt.hash('SenhaCorreta@123', 12);
      usersService.findByEmail.mockResolvedValue({ ...usuarioMock, senhaHash });
      prisma.refreshToken.create.mockResolvedValue({});

      const resultado = await service.login({
        email: usuarioMock.email,
        senha: 'SenhaCorreta@123',
      });

      expect(resultado.accessToken).toBe('token-assinado');
      expect(resultado.usuario.email).toBe(usuarioMock.email);
      expect(usersService.atualizarUltimoLogin).toHaveBeenCalledWith(usuarioMock.id);
    });
  });

  describe('refresh', () => {
    it('deve lançar UnauthorizedException se o refresh token não existir', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('token-invalido')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se o refresh token estiver expirado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        revoked: false,
        expiresAt: new Date(Date.now() - 1000),
        userId: usuarioMock.id,
      });

      await expect(service.refresh('token-expirado')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
