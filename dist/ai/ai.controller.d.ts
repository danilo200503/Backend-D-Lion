import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { FiscalService } from '../fiscal/fiscal.service';
import { AiService } from './ai.service';
import { AnalisarDocumentoDto } from './dto/analisar-documento.dto';
import { ResultadoAnaliseFiscalDto } from './dto/resultado-analise.dto';
export declare class AiController {
    private readonly aiService;
    private readonly fiscalService;
    private readonly usersService;
    constructor(aiService: AiService, fiscalService: FiscalService, usersService: UsersService);
    analisar(currentUser: AuthenticatedUser, dto: AnalisarDocumentoDto): Promise<ControllerResponse<ResultadoAnaliseFiscalDto>>;
}
