import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { PlanoTributarioService } from './plano-tributario.service';
import { GerarPlanoTributarioDto } from './dto/gerar-plano-tributario.dto';

@ApiTags('Plano Tributário')
@ApiBearerAuth()
@Controller('plano-tributario')
export class PlanoTributarioController {
  constructor(
    private readonly planoTributarioService: PlanoTributarioService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Gera, com IA, um plano tributário estratégico para um cliente' })
  @ApiResponse({ status: 201, description: 'Plano tributário gerado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Cliente sem dados suficientes para gerar o plano.' })
  @ApiResponse({ status: 403, description: 'Limite mensal de explicações por IA atingido.' })
  async gerar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: GerarPlanoTributarioDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const plano = await this.planoTributarioService.gerarPlano(usuario.companyId, usuario.id, dto.clienteId);
    return buildResponse(plano, 'Plano tributário gerado com sucesso.');
  }

  @Get()
  @ApiOperation({ summary: 'Lista os planos tributários já gerados' })
  @ApiQuery({ name: 'clienteId', required: false })
  async listar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('clienteId') clienteId?: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const planos = await this.planoTributarioService.listar(usuario.companyId, clienteId);
    return buildResponse(planos, 'Planos tributários listados com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um plano tributário específico' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const plano = await this.planoTributarioService.buscarPorId(usuario.companyId, id);
    return buildResponse(plano, 'Plano tributário encontrado.');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove um plano tributário' })
  async remover(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<null>> {
    const usuario = await this.usersService.findById(currentUser.id);
    await this.planoTributarioService.remover(usuario.companyId, id);
    return buildResponse(null, 'Plano tributário removido com sucesso.');
  }
}
