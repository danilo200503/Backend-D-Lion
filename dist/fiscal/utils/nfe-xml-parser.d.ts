export interface ImpostoExtraido {
    tipo: string;
    valor: number;
}
export interface ItemFiscalExtraido {
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
export interface DadosNfeExtraidos {
    tipoDocumento: 'NFE' | 'NFCE' | 'CTE' | 'MDFE' | 'NFSE';
    empresa?: string;
    cnpj?: string;
    numeroNota?: string;
    serie?: string;
    chaveAcesso?: string;
    dataEmissao?: string;
    destinatario?: string;
    destinatarioCnpj?: string;
    destinatarioUf?: string;
    municipio?: string;
    uf?: string;
    indicadorIE?: string;
    valorTotal?: number;
    impostos: ImpostoExtraido[];
    itens: ItemFiscalExtraido[];
    alertas: string[];
}
export declare function extrairDadosNfe(xmlContent: string): DadosNfeExtraidos;
