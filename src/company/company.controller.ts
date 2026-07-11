import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { Role } from '../common/enums/role.enum';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { CompanyService } from './company.service';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Lista todas as empresas cadastradas (somente Administrador)' })
  @ApiResponse({ status: 200, description: 'Lista de empresas retornada com sucesso.', type: [CompanyResponseDto] })
  async findAll(): Promise<ControllerResponse<CompanyResponseDto[]>> {
    const empresas = await this.companyService.findAll();
    const dtos = empresas.map((empresa) => this.companyService.toResponseDto(empresa));
    return buildResponse(dtos, 'Empresas listadas com sucesso.');
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados da empresa do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Empresa retornada com sucesso.', type: CompanyResponseDto })
  async findMe(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ControllerResponse<CompanyResponseDto>> {
    const usuario = await this.usersService.findById(currentUser.id);
    return buildResponse(
      this.companyService.toResponseDto(usuario.company),
      'Empresa obtida com sucesso.',
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Retorna uma empresa pelo id (somente Administrador)' })
  @ApiResponse({ status: 200, description: 'Empresa retornada com sucesso.', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada.' })
  async findById(@Param('id') id: string): Promise<ControllerResponse<CompanyResponseDto>> {
    const empresa = await this.companyService.findById(id);
    return buildResponse(this.companyService.toResponseDto(empresa), 'Empresa obtida com sucesso.');
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cadastra uma nova empresa (somente Administrador)' })
  @ApiResponse({ status: 201, description: 'Empresa cadastrada com sucesso.', type: CompanyResponseDto })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado.' })
  async create(@Body() dto: CreateCompanyDto): Promise<ControllerResponse<CompanyResponseDto>> {
    const empresa = await this.companyService.create(dto);
    return buildResponse(this.companyService.toResponseDto(empresa), 'Empresa cadastrada com sucesso.');
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualiza uma empresa existente (somente Administrador)' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso.', type: CompanyResponseDto })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada.' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado por outra empresa.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ): Promise<ControllerResponse<CompanyResponseDto>> {
    const empresa = await this.companyService.update(id, dto);
    return buildResponse(this.companyService.toResponseDto(empresa), 'Empresa atualizada com sucesso.');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove uma empresa sem usuários vinculados (somente Administrador)' })
  @ApiResponse({ status: 200, description: 'Empresa removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada.' })
  @ApiResponse({ status: 409, description: 'Empresa possui usuários vinculados.' })
  async remove(@Param('id') id: string): Promise<ControllerResponse<null>> {
    await this.companyService.remove(id);
    return buildResponse(null, 'Empresa removida com sucesso.');
  }
}
