export declare class CompanyProfileDto {
    id: string;
    name: string;
    cnpj: string;
}
export declare class UserProfileDto {
    id: string;
    nome: string;
    email: string;
    company: CompanyProfileDto;
    cargo?: string;
    telefone?: string;
    avatar?: string;
    ativo: boolean;
    ultimoLogin?: Date;
    permissoes: string[];
    createdAt: Date;
}
