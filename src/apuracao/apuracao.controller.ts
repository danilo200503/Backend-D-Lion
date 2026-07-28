import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { ApuracaoService } from './apuracao.service';
import { CreateApuracaoDto } from './dto/create-apuracao.dto';

@ApiTags('Apuração')
@ApiBearerAuth()
@Controller('apuracao')
export class ApuracaoController {
  constructor(
    private readonly apuracaoService: ApuracaoService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Calcula e registra uma apuração fiscal (Simples Nacional, Presumido ou Real)' })
  @ApiResponse({ status: 201, description: 'Apuração calculada e registrada com sucesso.' })
  async criar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateApuracaoDto,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const apuracao = await this.apuracaoService.calcularECriar(usuario.companyId, usuario.id, dto);
    return buildResponse(apuracao, 'Apuração calculada com sucesso.');
  }

  @Get()
  @ApiOperation({ summary: 'Lista as apurações fiscais da empresa do usuário logado' })
  async listar(@CurrentUser() currentUser: AuthenticatedUser): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const apuracoes = await this.apuracaoService.listar(usuario.companyId);
    return buildResponse(apuracoes, 'Apurações listadas com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma apuração fiscal específica' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<unknown>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const apuracao = await this.apuracaoService.buscarPorId(usuario.companyId, id);
    return buildResponse(apuracao, 'Apuração encontrada.');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove uma apuração fiscal' })
  async remover(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<null>> {
    const usuario = await this.usersService.findById(currentUser.id);
    await this.apuracaoService.remover(usuario.companyId, id);
    return buildResponse(null, 'Apuração removida com sucesso.');
  }

  @Post(':id/explicar')
  @ApiOperation({ summary: 'Gera, com IA, uma explicação desta apuração (opcional, sob demanda)' })
  @ApiResponse({ status: 403, description: 'Limite mensal de explicações por IA atingido.' })
  async explicar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<{ explicacao: string }>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const explicacao = await this.apuracaoService.explicarComIA(usuario.companyId, id);
    return buildResponse({ explicacao }, 'Explicação gerada com sucesso.');
  }
}
