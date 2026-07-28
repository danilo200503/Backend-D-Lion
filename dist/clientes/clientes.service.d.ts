import { PrismaService } from '../database/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
export declare class ClientesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criar(companyId: string, dto: CreateClienteDto): Promise<{
        nome: string;
        telefone: string | null;
        id: string;
        email: string | null;
        companyId: string;
        updatedAt: Date;
        empresa: string | null;
        criadoEm: Date;
        cpfCnpj: string | null;
    }>;
    listar(companyId: string, busca?: string): Promise<{
        nome: string;
        telefone: string | null;
        id: string;
        email: string | null;
        companyId: string;
        updatedAt: Date;
        empresa: string | null;
        criadoEm: Date;
        cpfCnpj: string | null;
    }[]>;
    buscarPorId(companyId: string, id: string): Promise<{
        nome: string;
        telefone: string | null;
        id: string;
        email: string | null;
        companyId: string;
        updatedAt: Date;
        empresa: string | null;
        criadoEm: Date;
        cpfCnpj: string | null;
    }>;
    atualizar(companyId: string, id: string, dto: UpdateClienteDto): Promise<{
        nome: string;
        telefone: string | null;
        id: string;
        email: string | null;
        companyId: string;
        updatedAt: Date;
        empresa: string | null;
        criadoEm: Date;
        cpfCnpj: string | null;
    }>;
    excluir(companyId: string, id: string): Promise<{
        removido: boolean;
    }>;
}
