import { DocumentoParaAnalise, ErroFiscal, ItemParaAnalise } from '../interfaces/analise-fiscal.interface';
export type RegraFiscal = (documento: DocumentoParaAnalise) => ErroFiscal[];
export declare const TODAS_AS_REGRAS: RegraFiscal[];
export type { ItemParaAnalise };
