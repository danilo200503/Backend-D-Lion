export interface FaixaSimplesNacional {
  ate: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
}

export const TABELA_ANEXO_I_COMERCIO: FaixaSimplesNacional[] = [
  { ate: 180000, aliquotaNominal: 0.04, parcelaDeduzir: 0 },
  { ate: 360000, aliquotaNominal: 0.073, parcelaDeduzir: 5940 },
  { ate: 720000, aliquotaNominal: 0.095, parcelaDeduzir: 13860 },
  { ate: 1800000, aliquotaNominal: 0.107, parcelaDeduzir: 22500 },
  { ate: 3600000, aliquotaNominal: 0.143, parcelaDeduzir: 87300 },
  { ate: 4800000, aliquotaNominal: 0.19, parcelaDeduzir: 378000 },
];

export const TABELA_ANEXO_III_SERVICOS: FaixaSimplesNacional[] = [
  { ate: 180000, aliquotaNominal: 0.06, parcelaDeduzir: 0 },
  { ate: 360000, aliquotaNominal: 0.112, parcelaDeduzir: 9360 },
  { ate: 720000, aliquotaNominal: 0.135, parcelaDeduzir: 17640 },
  { ate: 1800000, aliquotaNominal: 0.16, parcelaDeduzir: 35640 },
  { ate: 3600000, aliquotaNominal: 0.21, parcelaDeduzir: 125640 },
  { ate: 4800000, aliquotaNominal: 0.33, parcelaDeduzir: 648000 },
];

export function calcularSimplesNacional(params: {
  anexo: 'I' | 'III';
  receitaBrutaUltimos12Meses: number;
  receitaBrutaDoMes: number;
}): { aliquotaEfetiva: number; valorDevido: number; faixaUtilizada: number } {
  const tabela = params.anexo === 'I' ? TABELA_ANEXO_I_COMERCIO : TABELA_ANEXO_III_SERVICOS;

  if (params.receitaBrutaUltimos12Meses > 4800000) {
    throw new Error(
      'Receita bruta dos últimos 12 meses excede o limite do Simples Nacional (R$ 4.800.000,00). Esta empresa deve ser tributada em outro regime.',
    );
  }

  const indiceFaixa = tabela.findIndex((faixa) => params.receitaBrutaUltimos12Meses <= faixa.ate);
  const faixa = tabela[indiceFaixa === -1 ? tabela.length - 1 : indiceFaixa];

  const aliquotaEfetiva =
    (params.receitaBrutaUltimos12Meses * faixa.aliquotaNominal - faixa.parcelaDeduzir) /
    params.receitaBrutaUltimos12Meses;

  const aliquotaEfetivaFinal = Math.max(0, aliquotaEfetiva);
  const valorDevido = aliquotaEfetivaFinal * params.receitaBrutaDoMes;

  return {
    aliquotaEfetiva: Number((aliquotaEfetivaFinal * 100).toFixed(4)),
    valorDevido: Number(valorDevido.toFixed(2)),
    faixaUtilizada: indiceFaixa === -1 ? tabela.length : indiceFaixa + 1,
  };
}
