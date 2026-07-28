import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { LancamentosService } from './lancamentos.service';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

@ApiTags('Lançamentos Fiscais')
@ApiBearerAuth()
@Controller('lancamentos')
export class LancamentosController {
  constructor(
    private readonly lancamentosService: LancamentosService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra um novo lançamento fiscal (nota, cupom, DANFE ou outro)' })
  @ApiResponse({ status: 201, description: 'Lançamento registrado com sucesso.' })
  async criar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateLancamentoDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const lancamento = await this.lancamentosService.criar(usuario.companyId, usuario.id, dto);
    return buildResponse(lancamento, 'Lançamento registrado com sucesso.');
  }

  @Get()
  @ApiOperation({ summary: 'Lista os lançamentos fiscais da empresa do usuário logado' })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'naturezaOperacao', required: false })
  async listar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('tipo') tipo?: string,
    @Query('naturezaOperacao') naturezaOperacao?: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const lancamentos = await this.lancamentosService.listar(usuario.companyId, { tipo, naturezaOperacao });
    return buildResponse(lancamentos, 'Lançamentos listados com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um lançamento fiscal específico' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const lancamento = await this.lancamentosService.buscarPorId(usuario.companyId, id);
    return buildResponse(lancamento, 'Lançamento encontrado.');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um lançamento fiscal' })
  async atualizar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLancamentoDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const lancamento = await this.lancamentosService.atualizar(usuario.companyId, id, dto);
    return buildResponse(lancamento, 'Lançamento atualizado com sucesso.');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove um lançamento fiscal' })
  async remover(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<null>> {
    const usuario = await this.usersService.findById(currentUser.id);
    await this.lancamentosService.remover(usuario.companyId, id);
    return buildResponse(null, 'Lançamento removido com sucesso.');
  }

  @Post(':id/explicar')
  @ApiOperation({ summary: 'Gera, com IA, uma análise deste lançamento (opcional, sob demanda)' })
  @ApiResponse({ status: 403, description: 'Limite mensal de explicações por IA atingido.' })
  async explicar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<{ explicacao: string }>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const explicacao = await this.lancamentosService.explicarComIA(usuario.companyId, id);
    return buildResponse({ explicacao }, 'Análise por IA gerada com sucesso.');
  }
}
