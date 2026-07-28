export declare function normalizarTelefoneBrasil(telefone: string): string;
export declare function montarMensagemCobranca(params: {
    descricao: string;
    valor?: number | null;
    vencimento: Date;
}): string;
export declare function montarLinkWhatsapp(telefone: string, mensagem: string): string;
