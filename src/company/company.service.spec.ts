import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../database/prisma.service';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: {
    company: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      company: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: prisma },
        { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findById', () => {
    it('deve lançar NotFoundException quando a empresa não existir', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findById('id-inexistente')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve retornar a empresa quando existir', async () => {
      const empresa = { id: '1', name: 'Empresa Teste', cnpj: '00.000.000/0001-00' };
      prisma.company.findUnique.mockResolvedValue(empresa);

      await expect(service.findById('1')).resolves.toEqual(empresa);
    });
  });

  describe('create', () => {
    it('deve lançar ConflictException se o CNPJ já estiver cadastrado', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: '1', cnpj: '00.000.000/0001-00' });

      await expect(
        service.create({ name: 'Nova Empresa', cnpj: '00.000.000/0001-00' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve criar a empresa quando o CNPJ ainda não existir', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({
        id: '1',
        name: 'Nova Empresa',
        cnpj: '00.000.000/0001-00',
      });

      const resultado = await service.create({ name: 'Nova Empresa', cnpj: '00.000.000/0001-00' });

      expect(resultado.name).toBe('Nova Empresa');
      expect(prisma.company.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('deve lançar ConflictException quando existirem usuários vinculados', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Empresa Teste' });
      prisma.user.count.mockResolvedValue(2);

      await expect(service.remove('1')).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.company.delete).not.toHaveBeenCalled();
    });

    it('deve remover a empresa quando não houver usuários vinculados', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: '1', name: 'Empresa Teste' });
      prisma.user.count.mockResolvedValue(0);
      prisma.company.delete.mockResolvedValue({});

      await service.remove('1');

      expect(prisma.company.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
