import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { CompanyService } from './company.service';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyController {
    private readonly companyService;
    private readonly usersService;
    constructor(companyService: CompanyService, usersService: UsersService);
    findAll(): Promise<ControllerResponse<CompanyResponseDto[]>>;
    findMe(currentUser: AuthenticatedUser): Promise<ControllerResponse<CompanyResponseDto>>;
    findById(id: string): Promise<ControllerResponse<CompanyResponseDto>>;
    create(dto: CreateCompanyDto): Promise<ControllerResponse<CompanyResponseDto>>;
    update(id: string, dto: UpdateCompanyDto): Promise<ControllerResponse<CompanyResponseDto>>;
    remove(id: string): Promise<ControllerResponse<null>>;
}
