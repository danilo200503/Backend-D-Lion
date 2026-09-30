import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AnthropicService } from '../ai/services/anthropic.service';
import { IaUsoService } from '../ai/services/ia-uso.service';
import { ClientesService } from '../clientes/clientes.service';

@Injectable()
export class PlanoTributarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly anthropicService: AnthropicService,
    private readonly iaUsoService: IaUsoService,
    private readonly clientesService: ClientesService,
  ) {}

  async gerarPlano(companyId: string, criadoPorId: string, clienteId: string) {
    const cliente = await this.clientesService.buscarPorId(companyId, clienteId);

    const apuracoes = await this.prisma.apuracao.findMany({
      where: { companyId, clienteId },
      orderBy: { competencia: 'desc' },
      take: 12,
    });

    const lancamentos = await this.prisma.lancamentoFiscal.findMany({
      where: { companyId, clienteId },
      include: { documentoFiscal: true },
      orderBy: { dataCompetencia: 'desc' },
      take: 30,
    });

    if (apuracoes.length === 0 && lancamentos.length === 0) {
      throw new BadRequestException(
        'Este cliente ainda não possui apurações nem lançamentos registrados no sistema. Registre ao menos um antes de gerar o plano tributário.',
      );
    }

    await this.iaUsoService.verificarEIncrementarUso(companyId);

    const resumoDados = this.montarResumoDados(apuracoes, lancamentos);
    const conteudo = await this.gerarConteudoComIA(cliente.nome, cliente.empresa, resumoDados);

    return this.prisma.planoTributario.create({
      data: {
        companyId,
        criadoPorId,
        clienteId,
        conteudo,
        resumoDados: resumoDados as unknown as object,
      },
      include: { cliente: true },
    });
  }

  async listar(companyId: string, clienteId?: string) {
    return this.prisma.planoTributario.findMany({
      where: { companyId, ...(clienteId ? { clienteId } : {}) },
      include: { cliente: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const plano = await this.prisma.planoTributario.findFirst({
      where: { id, companyId },
      include: { cliente: true },
    });

    if (!plano) {
      throw new NotFoundException('Plano tributário não encontrado.');
    }

    return plano;
  }

  async remover(companyId: string, id: string): Promise<void> {
    await this.buscarPorId(companyId, id);
    await this.prisma.planoTributario.delete({ where: { id } });
  }

  private montarResumoDados(
    apuracoes: Array<{
      competencia: string;
      regimeTributario: string;
      totalDebitos: number;
      totalCreditos: number;
      valorApurado: number;
      receitaBrutaPeriodo: number | null;
    }>,
    lancamentos: Array<{
      tipo: string;
      naturezaOperacao: string;
      valor: number;
      documentoFiscal: { tipoDocumento: string | null; scoreFiscal: number | null; classificacao: string | null } | null;
    }>,
  ) {
    const regimesUsados = [...new Set(apuracoes.map((a) => a.regimeTributario))];
    const valorMedioApurado = apuracoes.length
      ? apuracoes.reduce((soma, a) => soma + a.valorApurado, 0) / apuracoes.length
      : 0;
    const receitaMediaPeriodo = apuracoes.filter((a) => a.receitaBrutaPeriodo).length
      ? apuracoes.reduce((soma, a) => soma + (a.receitaBrutaPeriodo ?? 0), 0) /
        apuracoes.filter((a) => a.receitaBrutaPeriodo).length
      : undefined;

    const scoresFiscais = lancamentos
      .map((l) => l.documentoFiscal?.scoreFiscal)
      .filter((score): score is number => typeof score === 'number');
    const scoreMedioDocumentos = scoresFiscais.length
      ? scoresFiscais.reduce((soma, s) => soma + s, 0) / scoresFiscais.length
      : undefined;

    const totalEntradas = lancamentos
      .filter((l) => l.naturezaOperacao === 'ENTRADA')
      .reduce((soma, l) => soma + l.valor, 0);
    const totalSaidas = lancamentos
      .filter((l) => l.naturezaOperacao === 'SAIDA')
      .reduce((soma, l) => soma + l.valor, 0);

    return {
      quantidadeApuracoes: apuracoes.length,
      regimesUsados,
      valorMedioApurado: Number(valorMedioApurado.toFixed(2)),
      receitaMediaPeriodo: receitaMediaPeriodo ? Number(receitaMediaPeriodo.toFixed(2)) : undefined,
      quantidadeLancamentos: lancamentos.length,
      totalEntradas: Number(totalEntradas.toFixed(2)),
      totalSaidas: Number(totalSaidas.toFixed(2)),
      scoreMedioDocumentosFiscais: scoreMedioDocumentos ? Number(scoreMedioDocumentos.toFixed(1)) : undefined,
      ultimasApuracoes: apuracoes.slice(0, 6).map((a) => ({
        competencia: a.competencia,
        regime: a.regimeTributario,
        valorApurado: a.valorApurado,
      })),
    };
  }

  private async gerarConteudoComIA(
    nomeCliente: string,
    empresaCliente: string | null | undefined,
    resumo: ReturnType<PlanoTributarioService['montarResumoDados']>,
  ): Promise<string> {
    const userPrompt = `Trace um plano tributário estratégico para o seguinte cliente, com base exclusivamente nos dados informados abaixo:

Cliente: ${nomeCliente}${empresaCliente ? ` (${empresaCliente})` : ''}

Dados extraídos do sistema:
- Quantidade de apurações registradas: ${resumo.quantidadeApuracoes}
- Regime(s) tributário(s) já utilizado(s): ${resumo.regimesUsados.join(', ') || 'não informado'}
- Valor médio apurado a recolher por período: R$ ${resumo.valorMedioApurado.toFixed(2)}
${resumo.receitaMediaPeriodo ? `- Receita bruta média do período: R$ ${resumo.receitaMediaPeriodo.toFixed(2)}` : ''}
- Quantidade de lançamentos fiscais registrados: ${resumo.quantidadeLancamentos}
- Total de entradas registradas: R$ ${resumo.totalEntradas.toFixed(2)}
- Total de saídas registradas: R$ ${resumo.totalSaidas.toFixed(2)}
${resumo.scoreMedioDocumentosFiscais ? `- Score fiscal médio dos documentos analisados: ${resumo.scoreMedioDocumentosFiscais}/100` : ''}
- Últimas apurações: ${JSON.stringify(resumo.ultimasApuracoes)}

Com base nesses dados, sugira:
1. Se o regime tributário atual parece ser o mais vantajoso, ou se vale avaliar mudança (explique o porquê, sem garantir números exatos)
2. Oportunidades legais de redução de carga tributária plausíveis para esse perfil
3. Pontos de atenção identificados nos dados (ex: score fiscal baixo, inconsistência entre entradas e saídas)
4. Próximos passos recomendados

Seja específico com os números fornecidos, mas deixe claro que são recomendações estratégicas gerais, não um parecer tributário definitivo.`;

    const systemPrompt =
      'Você é um assistente de planejamento tributário para contadores brasileiros. ' +
      'Use apenas os dados fornecidos, sem inventar números ou presumir informações que não foram dadas. ' +
      'Nunca garanta economia exata nem prometa resultado específico — fale em termos de "pode ser vantajoso avaliar", ' +
      '"vale considerar", etc. Termine sempre deixando claro que o plano é uma sugestão estratégica de apoio, ' +
      'e que a decisão final deve ser validada por um contador com registro profissional (CRC), considerando a ' +
      'legislação vigente e as particularidades do cliente. Responda em português, organizado em tópicos, no máximo 8 parágrafos.';

    return this.anthropicService.gerarTexto(systemPrompt, userPrompt);
  }
}
