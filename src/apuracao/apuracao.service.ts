import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AnthropicService } from '../ai/services/anthropic.service';
import { IaUsoService } from '../ai/services/ia-uso.service';
import { CreateApuracaoDto } from './dto/create-apuracao.dto';
import { calcularSimplesNacional } from './utils/simples-nacional.util';

@Injectable()
export class ApuracaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anthropicService: AnthropicService,
    private readonly iaUsoService: IaUsoService,
  ) {}

  async calcularECriar(companyId: string, criadoPorId: string, dto: CreateApuracaoDto) {
    if (dto.regimeTributario === 'SIMPLES_NACIONAL') {
      return this.calcularSimples(companyId, criadoPorId, dto);
    }

    return this.calcularPresumidoOuReal(companyId, criadoPorId, dto);
  }

  private async calcularSimples(companyId: string, criadoPorId: string, dto: CreateApuracaoDto) {
    if (!dto.anexoSimples) {
      throw new BadRequestException('Informe o anexo do Simples Nacional (I - Comércio ou III - Serviços).');
    }

    if (!dto.receitaBrutaUltimos12Meses) {
      throw new BadRequestException('Informe a receita bruta acumulada dos últimos 12 meses (RBT12).');
    }

    const resultado = calcularSimplesNacional({
      anexo: dto.anexoSimples,
      receitaBrutaUltimos12Meses: dto.receitaBrutaUltimos12Meses,
      receitaBrutaDoMes: dto.receitaBrutaPeriodo,
    });

    return this.prisma.apuracao.create({
      data: {
        companyId,
        criadoPorId,
        competencia: dto.competencia,
        regimeTributario: dto.regimeTributario,
        receitaBrutaPeriodo: dto.receitaBrutaPeriodo,
        totalDebitos: resultado.valorDevido,
        totalCreditos: 0,
        valorApurado: resultado.valorDevido,
        detalhamento: {
          anexo: dto.anexoSimples,
          receitaBrutaUltimos12Meses: dto.receitaBrutaUltimos12Meses,
          aliquotaEfetivaPercentual: resultado.aliquotaEfetiva,
          faixaUtilizada: resultado.faixaUtilizada,
          metodologia:
            'Cálculo baseado na tabela oficial do Simples Nacional (LC 123/2006, alterada pela LC 155/2016). Valores de referência — confirme sempre no PGDAS-D oficial antes de recolher.',
        },
      },
    });
  }

  private async calcularPresumidoOuReal(companyId: string, criadoPorId: string, dto: CreateApuracaoDto) {
    if (dto.totalDebitos === undefined || dto.totalCreditos === undefined) {
      throw new BadRequestException(
        'Para Lucro Presumido ou Lucro Real, informe o total de débitos e o total de créditos do período.',
      );
    }

    const valorApurado = Math.max(0, dto.totalDebitos - dto.totalCreditos);

    return this.prisma.apuracao.create({
      data: {
        companyId,
        criadoPorId,
        competencia: dto.competencia,
        regimeTributario: dto.regimeTributario,
        receitaBrutaPeriodo: dto.receitaBrutaPeriodo,
        totalDebitos: dto.totalDebitos,
        totalCreditos: dto.totalCreditos,
        valorApurado,
        detalhamento: {
          metodologia:
            'Cálculo simplificado por débito e crédito (débitos informados menos créditos informados). Não substitui a apuração completa de IRPJ/CSLL/PIS/COFINS/ICMS conforme a legislação vigente — use como ponto de partida e valide com um contador antes de recolher.',
        },
      },
    });
  }

  async listar(companyId: string) {
    return this.prisma.apuracao.findMany({
      where: { companyId },
      orderBy: { competencia: 'desc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const apuracao = await this.prisma.apuracao.findFirst({ where: { id, companyId } });

    if (!apuracao) {
      throw new NotFoundException('Apuração não encontrada.');
    }

    return apuracao;
  }

  async remover(companyId: string, id: string): Promise<void> {
    await this.buscarPorId(companyId, id);
    await this.prisma.apuracao.delete({ where: { id } });
  }

  async explicarComIA(companyId: string, id: string): Promise<string> {
    const apuracao = await this.buscarPorId(companyId, id);
    await this.iaUsoService.verificarEIncrementarUso(companyId);

    const detalhamento = apuracao.detalhamento as Record<string, unknown> | null;

    const userPrompt = `Explique esta apuração fiscal para um contador, em linguagem clara, destacando como o valor foi calculado e se há algo que mereça atenção:

Competência: ${apuracao.competencia}
Regime tributário: ${apuracao.regimeTributario}
Receita bruta do período: R$ ${apuracao.receitaBrutaPeriodo?.toFixed(2) ?? 'não informada'}
Total de débitos: R$ ${apuracao.totalDebitos.toFixed(2)}
Total de créditos: R$ ${apuracao.totalCreditos.toFixed(2)}
Valor apurado a recolher: R$ ${apuracao.valorApurado.toFixed(2)}
Metodologia utilizada: ${(detalhamento?.metodologia as string) ?? 'não informada'}
${detalhamento?.aliquotaEfetivaPercentual ? `Alíquota efetiva aplicada: ${detalhamento.aliquotaEfetivaPercentual}%` : ''}`;

    const systemPrompt =
      'Você é um assistente que explica cálculos de apuração fiscal para contadores brasileiros. ' +
      'Use apenas os números fornecidos, sem inventar valores. Deixe claro que esta é uma apuração de apoio ' +
      'e que a validação final deve ser feita pelo contador responsável antes do recolhimento. ' +
      'Responda em português, no máximo 5 parágrafos curtos.';

    const explicacao = await this.anthropicService.gerarTexto(systemPrompt, userPrompt);

    await this.prisma.apuracao.update({
      where: { id },
      data: { explicacaoIA: explicacao },
    });

    return explicacao;
  }
}
