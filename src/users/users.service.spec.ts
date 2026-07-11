import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    role: {
      findUnique: jest.Mock;
    };
    company: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('deve lançar ConflictException se o e-mail já existir', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'existente@teste.com' });

      await expect(
        service.create({
          nome: 'Teste',
          email: 'existente@teste.com',
          senha: 'Senha@123',
          companyId: 'company-1',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve criar um novo usuário com senha em hash e role padrão', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.company.findUnique.mockResolvedValue({ id: 'company-1', name: 'Empresa Teste' });
      prisma.role.findUnique.mockResolvedValue({ id: 'role-1', nome: 'Cliente' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'novo@teste.com',
        senhaHash: 'hash',
        userRoles: [{ role: { nome: 'Cliente' } }],
      });

      const resultado = await service.create({
        nome: 'Novo Usuário',
        email: 'novo@teste.com',
        senha: 'Senha@123',
        companyId: 'company-1',
      });

      expect(resultado.email).toBe('novo@teste.com');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('id-inexistente')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('deve lançar UnauthorizedException se a senha atual estiver incorreta', async () => {
      const senhaHash = await bcrypt.hash('SenhaCorreta@123', 12);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', senhaHash, userRoles: [] });

      await expect(
        service.changePassword('user-1', {
          senhaAtual: 'SenhaErrada@123',
          novaSenha: 'NovaSenha@456',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('deve atualizar a senha quando a senha atual estiver correta', async () => {
      const senhaHash = await bcrypt.hash('SenhaCorreta@123', 12);
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', senhaHash, userRoles: [] });
      prisma.user.update.mockResolvedValue({});

      await service.changePassword('user-1', {
        senhaAtual: 'SenhaCorreta@123',
        novaSenha: 'NovaSenha@456',
      });

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAvatar', () => {
    it('deve atualizar o caminho do avatar do usuário', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'user@teste.com', userRoles: [] });
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        avatar: '/uploads/avatars/arquivo.png',
      });

      const resultado = await service.updateAvatar('user-1', '/uploads/avatars/arquivo.png');

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { avatar: '/uploads/avatars/arquivo.png' } }),
      );
      expect(resultado.avatar).toBe('/uploads/avatars/arquivo.png');
    });
  });
});
