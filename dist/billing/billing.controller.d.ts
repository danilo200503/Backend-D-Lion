import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { BillingService } from './billing.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
export declare class BillingController {
    private readonly billingService;
    private readonly usersService;
    constructor(billingService: BillingService, usersService: UsersService);
    criar(currentUser: AuthenticatedUser, dto: CreateCobrancaDto): Promise<ControllerResponse<unknown>>;
    listar(currentUser: AuthenticatedUser, status?: string, clienteId?: string): Promise<ControllerResponse<unknown>>;
    resumo(currentUser: AuthenticatedUser): Promise<ControllerResponse<unknown>>;
    historico(currentUser: AuthenticatedUser, clienteId?: string, tipoEnvio?: string, dataInicio?: string, dataFim?: string): Promise<ControllerResponse<unknown>>;
    buscarPorId(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<unknown>>;
    atualizar(currentUser: AuthenticatedUser, id: string, dto: UpdateCobrancaDto): Promise<ControllerResponse<unknown>>;
    excluir(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<unknown>>;
    enviarEmail(currentUser: AuthenticatedUser, id: string): Promise<{
        success: true;
    }>;
    enviarWhatsapp(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<{
        link: string;
        mensagem: string;
    }>>;
}
