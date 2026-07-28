import { PrismaService } from '../database/prisma.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { EmailService } from '../email/email.service';
interface FiltrosCobranca {
    status?: string;
    clienteId?: string;
}
interface FiltrosHistorico {
    clienteId?: string;
    tipoEnvio?: string;
    dataInicio?: string;
    dataFim?: string;
}
export declare class BillingService {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    criar(companyId: string, dto: CreateCobrancaDto): Promise<{
        id: string;
        companyId: string;
        updatedAt: Date;
        descricao: string;
        valor: number | null;
        status: import(".prisma/client").$Enums.StatusCobranca;
        clienteId: string;
        vencimento: Date;
        dataEnvio: Date | null;
        criadoEm: Date;
    }>;
    listar(companyId: string, filtros: FiltrosCobranca): Promise<({
        cliente: {
            nome: string;
            telefone: string | null;
            id: string;
            email: string | null;
            companyId: string;
            updatedAt: Date;
            empresa: string | null;
            criadoEm: Date;
            cpfCnpj: string | null;
        };
    } & {
        id: string;
        companyId: string;
        updatedAt: Date;
        descricao: string;
        valor: number | null;
        status: import(".prisma/client").$Enums.StatusCobranca;
        clienteId: string;
        vencimento: Date;
        dataEnvio: Date | null;
        criadoEm: Date;
    })[]>;
    buscarPorId(companyId: string, id: string): Promise<{
        cliente: {
            nome: string;
            telefone: string | null;
            id: string;
            email: string | null;
            companyId: string;
            updatedAt: Date;
            empresa: string | null;
            criadoEm: Date;
            cpfCnpj: string | null;
        };
    } & {
        id: string;
        companyId: string;
        updatedAt: Date;
        descricao: string;
        valor: number | null;
        status: import(".prisma/client").$Enums.StatusCobranca;
        clienteId: string;
        vencimento: Date;
        dataEnvio: Date | null;
        criadoEm: Date;
    }>;
    atualizar(companyId: string, id: string, dto: UpdateCobrancaDto): Promise<{
        id: string;
        companyId: string;
        updatedAt: Date;
        descricao: string;
        valor: number | null;
        status: import(".prisma/client").$Enums.StatusCobranca;
        clienteId: string;
        vencimento: Date;
        dataEnvio: Date | null;
        criadoEm: Date;
    }>;
    excluir(companyId: string, id: string): Promise<{
        removido: boolean;
    }>;
    resumo(companyId: string): Promise<{
        total: number;
        pendentes: number;
        pagas: number;
        atrasadas: number;
    }>;
    enviarPorEmail(companyId: string, cobrancaId: string): Promise<{
        id: string;
        companyId: string;
        updatedAt: Date;
        descricao: string;
        valor: number | null;
        status: import(".prisma/client").$Enums.StatusCobranca;
        clienteId: string;
        vencimento: Date;
        dataEnvio: Date | null;
        criadoEm: Date;
    }>;
    gerarLinkWhatsapp(companyId: string, cobrancaId: string): Promise<{
        link: string;
        mensagem: string;
    }>;
    listarHistorico(companyId: string, filtros: FiltrosHistorico): Promise<({
        cobranca: {
            cliente: {
                nome: string;
                telefone: string | null;
                id: string;
                email: string | null;
                companyId: string;
                updatedAt: Date;
                empresa: string | null;
                criadoEm: Date;
                cpfCnpj: string | null;
            };
        } & {
            id: string;
            companyId: string;
            updatedAt: Date;
            descricao: string;
            valor: number | null;
            status: import(".prisma/client").$Enums.StatusCobranca;
            clienteId: string;
            vencimento: Date;
            dataEnvio: Date | null;
            criadoEm: Date;
        };
    } & {
        id: string;
        dataEnvio: Date;
        tipoEnvio: import(".prisma/client").$Enums.TipoEnvioCobranca;
        cobrancaId: string;
    })[]>;
    private garantirClienteDaEmpresa;
}
export {};
