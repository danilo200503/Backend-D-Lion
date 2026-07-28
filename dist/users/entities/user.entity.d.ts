export declare class UserEntity {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    companyId: string;
    cargo?: string | null;
    telefone?: string | null;
    avatar?: string | null;
    ativo: boolean;
    ultimoLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
