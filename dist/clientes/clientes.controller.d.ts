import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
export declare class ClientesController {
    private readonly clientesService;
    private readonly usersService;
    constructor(clientesService: ClientesService, usersService: UsersService);
    criar(currentUser: AuthenticatedUser, dto: CreateClienteDto): Promise<ControllerResponse<unknown>>;
    listar(currentUser: AuthenticatedUser, busca?: string): Promise<ControllerResponse<unknown>>;
    buscarPorId(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<unknown>>;
    atualizar(currentUser: AuthenticatedUser, id: string, dto: UpdateClienteDto): Promise<ControllerResponse<unknown>>;
    excluir(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<unknown>>;
}
