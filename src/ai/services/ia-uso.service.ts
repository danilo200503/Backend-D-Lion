import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class IaUsoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {}

  async verificarEIncrementarUso(companyId: string): Promise<void> {
    const empresa = await this.prisma.company.findUnique({ where: { id: companyId } });
    const referenciaAtual = this.competenciaAtual();

    if (!empresa) return;

    const referenciaSalva = empresa.iaUsosMesReferencia;
    const usoAtual = referenciaSalva === referenciaAtual ? empresa.iaUsosMesAtual : 0;
    const limite = this.configService.limiteMensagensIaPorPlano;

    if (usoAtual >= limite) {
      throw new ForbiddenException(
        `Limite de ${limite} explicações por IA neste mês foi atingido. O limite é renovado no início do próximo mês.`,
      );
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        iaUsosMesAtual: usoAtual + 1,
        iaUsosMesReferencia: referenciaAtual,
      },
    });
  }

  async consultarUso(companyId: string): Promise<{ usados: number; limite: number }> {
    const empresa = await this.prisma.company.findUnique({ where: { id: companyId } });
    const referenciaAtual = this.competenciaAtual();
    const limite = this.configService.limiteMensagensIaPorPlano;

    if (!empresa || empresa.iaUsosMesReferencia !== referenciaAtual) {
      return { usados: 0, limite };
    }

    return { usados: empresa.iaUsosMesAtual, limite };
  }

  private competenciaAtual(): string {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  }
}
