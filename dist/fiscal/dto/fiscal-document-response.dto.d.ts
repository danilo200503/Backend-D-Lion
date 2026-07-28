export declare class ImpostoDto {
    tipo: string;
    valor: number;
}
export declare class FiscalDocumentResponseDto {
    id: string;
    nomeArquivo: string;
    status: string;
    empresa?: string;
    cnpj?: string;
    numeroNota?: string;
    valorTotal?: number;
    impostos?: ImpostoDto[];
    erros?: string[];
    alertas?: string[];
    recomendacoes?: string[];
    mensagemErro?: string;
    createdAt: Date;
}
