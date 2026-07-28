import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { FiscalService } from './fiscal.service';
import { FiscalDocumentResponseDto } from './dto/fiscal-document-response.dto';
export declare class FiscalController {
    private readonly fiscalService;
    private readonly usersService;
    constructor(fiscalService: FiscalService, usersService: UsersService);
    uploadXml(currentUser: AuthenticatedUser, file: Express.Multer.File): Promise<ControllerResponse<FiscalDocumentResponseDto>>;
    listar(currentUser: AuthenticatedUser): Promise<ControllerResponse<FiscalDocumentResponseDto[]>>;
    listarHistorico(currentUser: AuthenticatedUser): Promise<ControllerResponse<unknown[]>>;
    buscarPorId(currentUser: AuthenticatedUser, id: string): Promise<ControllerResponse<FiscalDocumentResponseDto>>;
}
