import { DocumentoParaAnalise, ErroFiscal, ResultadoAnaliseFiscal } from './interfaces/analise-fiscal.interface';
export declare class AiService {
    analisarDocumento(documentoId: string, documento: DocumentoParaAnalise): ResultadoAnaliseFiscal;
    private calcularScore;
    private classificar;
    explicarErro(erro: ErroFiscal): string;
}
