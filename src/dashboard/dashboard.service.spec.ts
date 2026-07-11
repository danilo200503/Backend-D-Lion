import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    user: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    company: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      company: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('deve retornar o resumo agregado do dashboard', async () => {
    prisma.user.count.mockResolvedValue(10);
    prisma.company.findMany.mockResolvedValue([{ name: 'Empresa A' }, { name: 'Empresa B' }]);
    prisma.user.findMany.mockResolvedValueOnce([
      { nome: 'Usuário 1', email: 'u1@teste.com', ultimoLogin: new Date() },
    ]);

    const resumo = await service.obterResumo();

    expect(resumo.totalUsuarios).toBe(10);
    expect(resumo.totalEmpresas).toBe(2);
    expect(resumo.empresas).toEqual(['Empresa A', 'Empresa B']);
    expect(resumo.ultimosLogins).toHaveLength(1);
    expect(resumo.totalXmlEnviados).toBe(0);
  });
});
