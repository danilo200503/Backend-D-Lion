declare const STATUS_VALIDOS: readonly ["PENDENTE", "ENVIADA", "PAGA", "ATRASADA"];
export declare class CreateCobrancaDto {
    clienteId: string;
    descricao: string;
    valor?: number;
    vencimento: string;
    status?: (typeof STATUS_VALIDOS)[number];
}
export {};
