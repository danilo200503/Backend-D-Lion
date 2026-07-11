import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { BillingService } from './billing.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova cobrança' })
  async criar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCobrancaDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cobranca = await this.billingService.criar(usuario.companyId, dto);
    return buildResponse(cobranca, 'Cobrança criada com sucesso.');
  }

  @Get()
  @ApiOperation({ summary: 'Lista as cobranças da empresa, com filtros opcionais' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'] })
  @ApiQuery({ name: 'clienteId', required: false })
  async listar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('clienteId') clienteId?: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cobrancas = await this.billingService.listar(usuario.companyId, { status, clienteId });
    return buildResponse(cobrancas, 'Cobranças listadas com sucesso.');
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Indicadores de cobranças para os cards do Dashboard' })
  async resumo(@CurrentUser() currentUser: AuthenticatedUser): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const resumo = await this.billingService.resumo(usuario.companyId);
    return buildResponse(resumo, 'Resumo de cobranças obtido com sucesso.');
  }

  @Get('historico')
  @ApiOperation({ summary: 'Histórico de envios de cobrança (e-mail/WhatsApp)' })
  @ApiQuery({ name: 'clienteId', required: false })
  @ApiQuery({ name: 'tipoEnvio', required: false, enum: ['EMAIL', 'WHATSAPP'] })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  async historico(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('clienteId') clienteId?: string,
    @Query('tipoEnvio') tipoEnvio?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const historico = await this.billingService.listarHistorico(usuario.companyId, {
      clienteId,
      tipoEnvio,
      dataInicio,
      dataFim,
    });
    return buildResponse(historico, 'Histórico de envios listado com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma cobrança pelo ID' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cobranca = await this.billingService.buscarPorId(usuario.companyId, id);
    return buildResponse(cobranca);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita uma cobrança existente' })
  async atualizar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCobrancaDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const cobranca = await this.billingService.atualizar(usuario.companyId, id, dto);
    return buildResponse(cobranca, 'Cobrança atualizada com sucesso.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui uma cobrança' })
  async excluir(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const resultado = await this.billingService.excluir(usuario.companyId, id);
    return buildResponse(resultado, 'Cobrança excluída com sucesso.');
  }

  @Post('send-email/:id')
  @ApiOperation({ summary: 'Envia a cobrança por e-mail e atualiza o status para ENVIADA' })
  @ApiResponse({ status: 200, description: 'E-mail enviado com sucesso.' })
  async enviarEmail(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    const usuario = await this.usersService.findById(currentUser.id);
    await this.billingService.enviarPorEmail(usuario.companyId, id);
    return { success: true };
  }

  @Post('send-whatsapp/:id')
  @ApiOperation({
    summary: 'Gera o link do WhatsApp (wa.me) com a mensagem pré-preenchida e registra o envio no histórico',
  })
  async enviarWhatsapp(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<{ link: string; mensagem: string }>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const resultado = await this.billingService.gerarLinkWhatsapp(usuario.companyId, id);
    return buildResponse(resultado, 'Link do WhatsApp gerado com sucesso.');
  }
}
