import { Injectable } from '@nestjs/common';
import {
  ClassificacaoFiscal,
  DocumentoParaAnalise,
  ErroFiscal,
  ResultadoAnaliseFiscal,
} from './interfaces/analise-fiscal.interface';
import { TODAS_AS_REGRAS } from './rules/fiscal-rules';
import { AnthropicService } from './services/anthropic.service';

const SCORE_INICIAL = 100;
const SCORE_MINIMO = 0;

@Injectable()
export class AiService {
  constructor(private readonly anthropicService: AnthropicService) {}

  analisarDocumento(documentoId: string, documento: DocumentoParaAnalise): ResultadoAnaliseFiscal {
    const erros: ErroFiscal[] = TODAS_AS_REGRAS.flatMap((regra) => regra(documento));

    const score = this.calcularScore(erros);
    const classificacao = this.classificar(score);

    return {
      documentoId,
      score,
      classificacao,
      totalErros: erros.length,
      erros,
    };
  }

  async explicarAnaliseFiscal(params: {
    tipoDocumento?: string | null;
    empresa?: string | null;
    numeroNota?: string | null;
    score: number;
    classificacao: string;
    erros: ErroFiscal[];
  }): Promise<string> {
    const listaErros =
      params.erros.length > 0
        ? params.erros
            .map((erro, indice) => `${indice + 1}. [${erro.severidade}] ${erro.descricao} — ${erro.explicacao}`)
            .join('\n')
        : 'Nenhum erro foi encontrado pelas regras automáticas.';

    const userPrompt = `Documento: ${params.tipoDocumento ?? 'não identificado'} ${params.numeroNota ? `nº ${params.numeroNota}` : ''}, empresa "${params.empresa ?? 'não identificada'}".
Score Fiscal: ${params.score}/100 (${params.classificacao}).

Erros encontrados pelo motor de regras:
${listaErros}

Explique, em linguagem simples e direta para um contador, por que esse documento recebeu essa nota, destacando os erros mais graves primeiro e sugerindo a ordem de prioridade para corrigir.`;

    const systemPrompt =
      'Você é um assistente que explica resultados de auditoria fiscal automática para contadores brasileiros. ' +
      'Você NÃO decide se há erro ou não — isso já foi determinado por um motor de regras determinístico. ' +
      'Sua única função é traduzir o resultado já calculado em uma explicação clara, objetiva e em português, ' +
      'sem inventar erros que não estejam na lista fornecida e sem contradizer os valores informados. ' +
      'Seja conciso: no máximo 6 parágrafos curtos.';

    return this.anthropicService.gerarTexto(systemPrompt, userPrompt);
  }

  private calcularScore(erros: ErroFiscal[]): number {
    const totalPontosPerdidos = erros.reduce((total, erro) => total + erro.pontosPerdidos, 0);
    return Math.max(SCORE_MINIMO, SCORE_INICIAL - totalPontosPerdidos);
  }

  private classificar(score: number): ClassificacaoFiscal {
    if (score >= 95) return 'Excelente';
    if (score >= 80) return 'Boa';
    if (score >= 60) return 'Regular';
    return 'Ruim';
  }

  explicarErro(erro: ErroFiscal): string {
    return `${erro.explicacao} Como corrigir: ${erro.correcao}`;
  }
}
