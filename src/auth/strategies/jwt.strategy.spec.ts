import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AppConfigService, useValue: { jwtSecret: 'segredo' } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve lançar UnauthorizedException se o usuário não existir', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 'id-inexistente', email: 'x@x.com', roles: [] }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException se o usuário estiver inativo', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', ativo: false });

    await expect(
      strategy.validate({ sub: 'user-1', email: 'x@x.com', roles: [] }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve retornar o usuário autenticado quando válido e ativo', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', ativo: true });

    const resultado = await strategy.validate({
      sub: 'user-1',
      email: 'usuario@dlion.com.br',
      roles: ['Cliente'],
    });

    expect(resultado).toEqual({
      id: 'user-1',
      email: 'usuario@dlion.com.br',
      roles: ['Cliente'],
    });
  });
});
