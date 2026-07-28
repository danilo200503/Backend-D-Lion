import { AppConfigService } from '../config/app-config.service';
interface DadosEmailCobranca {
    destinatarioEmail: string;
    destinatarioNome: string;
    empresa: string;
    descricao: string;
    valor?: number | null;
    vencimento: Date;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: AppConfigService);
    enviarCobranca(dados: DadosEmailCobranca): Promise<void>;
    enviarVerificacaoEmail(destinatarioEmail: string, destinatarioNome: string, token: string): Promise<void>;
    enviarRedefinicaoSenha(destinatarioEmail: string, destinatarioNome: string, token: string): Promise<void>;
    private enviar;
    private montarTemplateBase;
    private montarTemplateCobranca;
}
export {};
