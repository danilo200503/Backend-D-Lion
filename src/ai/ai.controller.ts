import { Controller, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { FiscalService } from '../fiscal/fiscal.service';
import { AiService } from './ai.service';
import { IaUsoService } from './services/ia-uso.service';
import { AnalisarDocumentoDto } from './dto/analisar-documento.dto';
import { ExplicarAnaliseDto } from './dto/explicar-analise.dto';
import { ResultadoAnaliseFiscalDto } from './dto/resultado-analise.dto';
import { DocumentoParaAnalise, ErroFiscal, ItemParaAnalise } from './interfaces/analise-fiscal.interface';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly fiscalService: FiscalService,
    private readonly usersService: UsersService,
    private readonly iaUsoService: IaUsoService,
  ) {}

  @Post('analisar')
  @ApiOperation({ summary: 'Executa a análise fiscal (Score Fiscal + inconsistências) de um documento já enviado' })
  @ApiResponse({ status: 200, description: 'Análise concluída com sucesso.', type: ResultadoAnaliseFiscalDto })
  @ApiResponse({ status: 404, description: 'Documento fiscal não encontrado.' })
  async analisar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: AnalisarDocumentoDto,
  ): Promise<ControllerResponse<ResultadoAnaliseFiscalDto>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const documento = await this.fiscalService.buscarPorId(usuario.companyId, dto.xmlId);

    const documentoParaAnalise: DocumentoParaAnalise = {
      tipoDocumento: documento.tipoDocumento,
      cnpj: documento.cnpj,
      destinatarioCnpj: documento.destinatarioCnpj,
      destinatarioUf: documento.destinatarioUf,
      uf: documento.uf,
      municipio: documento.municipio,
      numeroNota: documento.numeroNota,
      serie: documento.serie,
      chaveAcesso: documento.chaveAcesso,
      dataEmissao: documento.dataEmissao,
      indicadorIE: documento.indicadorIE,
      valorTotal: documento.valorTotal,
      itens: ((documento.itens as unknown as ItemParaAnalise[]) ?? []) as ItemParaAnalise[],
    };

    const resultado = this.aiService.analisarDocumento(documento.id, documentoParaAnalise);

    await this.fiscalService.salvarResultadoAnalise(usuario.companyId, documento.id, resultado);

    return buildResponse(resultado as unknown as ResultadoAnaliseFiscalDto, 'Análise fiscal concluída com sucesso.');
  }

  @Post('explicar')
  @ApiOperation({ summary: 'Gera, com IA, uma explicação em linguagem natural do resultado já calculado' })
  @ApiResponse({ status: 200, description: 'Explicação gerada com sucesso.' })
  @ApiResponse({ status: 403, description: 'Limite mensal de explicações por IA atingido.' })
  async explicar(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ExplicarAnaliseDto,
  ): Promise<ControllerResponse<{ explicacao: string }>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const documento = await this.fiscalService.buscarPorId(usuario.companyId, dto.documentoId);

    await this.iaUsoService.verificarEIncrementarUso(usuario.companyId);

    const explicacao = await this.aiService.explicarAnaliseFiscal({
      tipoDocumento: documento.tipoDocumento,
      empresa: documento.empresa,
      numeroNota: documento.numeroNota,
      score: documento.scoreFiscal ?? 0,
      classificacao: documento.classificacao ?? 'Ainda não analisado',
      erros: ((documento.erros as unknown as ErroFiscal[]) ?? []) as ErroFiscal[],
    });

    return buildResponse({ explicacao }, 'Explicação gerada com sucesso.');
  }
}
