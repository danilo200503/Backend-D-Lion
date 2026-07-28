import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AnthropicService } from '../ai/services/anthropic.service';
import { IaUsoService } from '../ai/services/ia-uso.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

@Injectable()
export class LancamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anthropicService: AnthropicService,
    private readonly iaUsoService: IaUsoService,
  ) {}

  async criar(companyId: string, criadoPorId: string, dto: CreateLancamentoDto) {
    if (dto.documentoFiscalId) {
      const documento = await this.prisma.fiscalDocument.findFirst({
        where: { id: dto.documentoFiscalId, companyId },
      });
      if (!documento) {
        throw new NotFoundException('Documento fiscal vinculado não foi encontrado.');
      }
    }

    return this.prisma.lancamentoFiscal.create({
      data: {
        companyId,
        criadoPorId,
        tipo: dto.tipo,
        naturezaOperacao: dto.naturezaOperacao,
        dataCompetencia: new Date(dto.dataCompetencia),
        descricao: dto.descricao,
        valor: dto.valor,
        observacoes: dto.observacoes,
        documentoFiscalId: dto.documentoFiscalId,
      },
      include: { documentoFiscal: true },
    });
  }

  async listar(companyId: string, filtros?: { tipo?: string; naturezaOperacao?: string }) {
    return this.prisma.lancamentoFiscal.findMany({
      where: {
        companyId,
        ...(filtros?.tipo ? { tipo: filtros.tipo } : {}),
        ...(filtros?.naturezaOperacao ? { naturezaOperacao: filtros.naturezaOperacao } : {}),
      },
      include: { documentoFiscal: true },
      orderBy: { dataCompetencia: 'desc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const lancamento = await this.prisma.lancamentoFiscal.findFirst({
      where: { id, companyId },
      include: { documentoFiscal: true },
    });

    if (!lancamento) {
      throw new NotFoundException('Lançamento fiscal não encontrado.');
    }

    return lancamento;
  }

  async atualizar(companyId: string, id: string, dto: UpdateLancamentoDto) {
    await this.buscarPorId(companyId, id);

    return this.prisma.lancamentoFiscal.update({
      where: { id },
      data: {
        ...dto,
        dataCompetencia: dto.dataCompetencia ? new Date(dto.dataCompetencia) : undefined,
      },
      include: { documentoFiscal: true },
    });
  }

  async remover(companyId: string, id: string): Promise<void> {
    await this.buscarPorId(companyId, id);
    await this.prisma.lancamentoFiscal.delete({ where: { id } });
  }

  async explicarComIA(companyId: string, id: string): Promise<string> {
    const lancamento = await this.buscarPorId(companyId, id);
    await this.iaUsoService.verificarEIncrementarUso(companyId);

    const contextoDocumento = lancamento.documentoFiscal
      ? `Este lançamento está vinculado ao documento fiscal "${lancamento.documentoFiscal.nomeArquivo}", tipo ${lancamento.documentoFiscal.tipoDocumento ?? 'não identificado'}, com Score Fiscal ${lancamento.documentoFiscal.scoreFiscal ?? 'não calculado'} e classificação "${lancamento.documentoFiscal.classificacao ?? 'não calculada'}".`
      : 'Este lançamento não está vinculado a nenhum documento fiscal específico.';

    const userPrompt = `Analise este lançamento contábil e aponte, de forma objetiva, se há algo que mereça atenção do contador (falta de informação, valor incoerente com a descrição, inconsistência entre o tipo de documento e a natureza da operação, etc.):

Tipo: ${lancamento.tipo}
Natureza da operação: ${lancamento.naturezaOperacao}
Data de competência: ${lancamento.dataCompetencia.toLocaleDateString('pt-BR')}
Descrição: ${lancamento.descricao}
Valor: R$ ${lancamento.valor.toFixed(2)}
Observações informadas: ${lancamento.observacoes ?? 'nenhuma'}

${contextoDocumento}`;

    const systemPrompt =
      'Você é um assistente que revisa lançamentos contábeis e fiscais para contadores brasileiros. ' +
      'Você aponta apenas riscos e inconsistências plausíveis a partir dos dados fornecidos, sem inventar informações ' +
      'que não foram dadas. Se não houver nada de anormal, diga isso claramente e de forma breve. ' +
      'Responda em português, no máximo 4 parágrafos curtos.';

    const explicacao = await this.anthropicService.gerarTexto(systemPrompt, userPrompt);

    await this.prisma.lancamentoFiscal.update({
      where: { id },
      data: { explicacaoIA: explicacao },
    });

    return explicacao;
  }
}
