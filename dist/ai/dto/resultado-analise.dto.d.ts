export declare class ErroFiscalDto {
    tipo: string;
    descricao: string;
    explicacao: string;
    correcao: string;
    severidade: string;
    pontosPerdidos: number;
}
export declare class ResultadoAnaliseFiscalDto {
    documentoId: string;
    score: number;
    classificacao: string;
    totalErros: number;
    erros: ErroFiscalDto[];
}
