import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('Clientes')
@ApiBearerAuth()
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso.' })
  async criar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateClienteDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cliente = await this.clientesService.criar(usuario.companyId, dto);
    return buildResponse(cliente, 'Cliente cadastrado com sucesso.');
  }

  @Get()
  @ApiOperation({ summary: 'Lista os clientes da empresa, com pesquisa opcional' })
  @ApiQuery({ name: 'busca', required: false, description: 'Pesquisa por nome, empresa, CPF/CNPJ ou e-mail' })
  async listar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('busca') busca?: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const clientes = await this.clientesService.listar(usuario.companyId, busca);
    return buildResponse(clientes, 'Clientes listados com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cliente pelo ID' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cliente = await this.clientesService.buscarPorId(usuario.companyId, id);
    return buildResponse(cliente);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita um cliente existente' })
  async atualizar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cliente = await this.clientesService.atualizar(usuario.companyId, id, dto);
    return buildResponse(cliente, 'Cliente atualizado com sucesso.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui um cliente' })
  async excluir(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const resultado = await this.clientesService.excluir(usuario.companyId, id);
    return buildResponse(resultado, 'Cliente excluído com sucesso.');
  }
}
