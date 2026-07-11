import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DashboardResumoDto } from './dto/dashboard-resumo.dto';

const LIMITE_ULTIMOS_LOGINS = 5;


@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obterResumo(): Promise<DashboardResumoDto> {
    const [totalUsuarios, empresasCadastradas, ultimosLogins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.findMany({ select: { name: true } }),
      this.prisma.user.findMany({
        where: { ultimoLogin: { not: null } },
        orderBy: { ultimoLogin: 'desc' },
        take: LIMITE_ULTIMOS_LOGINS,
        select: { nome: true, email: true, ultimoLogin: true },
      }),
    ]);

    const empresas = empresasCadastradas.map((empresa) => empresa.name);

    return {
      totalUsuarios,
      totalEmpresas: empresas.length,
      totalXmlEnviados: 0,
      totalAnalises: 0,
      totalPendencias: 0,
      empresas,
      ultimosUploads: [],
      ultimosLogins: ultimosLogins.map((login) => ({
        usuario: login.nome,
        email: login.email,
        ultimoLogin: login.ultimoLogin as Date,
      })),
    };
  }
}
