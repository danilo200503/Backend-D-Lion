export type SeveridadeErro = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface ErroFiscal {
  tipo: string; 
  descricao: string;
  explicacao: string;
  correcao: string;
  severidade: SeveridadeErro;
  pontosPerdidos: number;
}

export type ClassificacaoFiscal = 'Excelente' | 'Boa' | 'Regular' | 'Ruim';

export interface ResultadoAnaliseFiscal {
  documentoId: string;
  score: number;
  classificacao: ClassificacaoFiscal;
  totalErros: number;
  erros: ErroFiscal[];
}

export interface ItemParaAnalise {
  cProd?: string;
  xProd?: string;
  ncm?: string;
  cfop?: string;
  cstIcms?: string;
  cstPis?: string;
  cstCofins?: string;
  vProd?: number;
  vICMS?: number;
  vIPI?: number;
  vPIS?: number;
  vCOFINS?: number;
}

export interface DocumentoParaAnalise {
  tipoDocumento?: string | null;
  cnpj?: string | null;
  destinatarioCnpj?: string | null;
  destinatarioUf?: string | null;
  uf?: string | null;
  municipio?: string | null;
  numeroNota?: string | null;
  serie?: string | null;
  chaveAcesso?: string | null;
  dataEmissao?: Date | null;
  indicadorIE?: string | null;
  valorTotal?: number | null;
  itens: ItemParaAnalise[];
}
