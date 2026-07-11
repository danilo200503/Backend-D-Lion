import { Injectable } from '@nestjs/common';
import {
  ClassificacaoFiscal,
  DocumentoParaAnalise,
  ErroFiscal,
  ResultadoAnaliseFiscal,
} from './interfaces/analise-fiscal.interface';
import { TODAS_AS_REGRAS } from './rules/fiscal-rules';

const SCORE_INICIAL = 100;
const SCORE_MINIMO = 0;

@Injectable()
export class AiService {
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
