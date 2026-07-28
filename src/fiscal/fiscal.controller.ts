import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-request.interface';
import { buildResponse } from '../common/utils/response.util';
import { ControllerResponse } from '../common/interceptors/response-transform.interceptor';
import { UsersService } from '../users/users.service';
import { FiscalService } from './fiscal.service';
import { fiscalXmlUploadOptions } from './config/fiscal-multer.config';
import { FiscalDocumentResponseDto } from './dto/fiscal-document-response.dto';

@ApiTags('Fiscal')
@ApiBearerAuth()
@Controller('fiscal')
export class FiscalController {
  constructor(
    private readonly fiscalService: FiscalService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload-xml')
  @UseInterceptors(FileInterceptor('arquivo', fiscalXmlUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Envia um arquivo XML (pode conter uma ou várias notas agrupadas)' })
  @ApiResponse({ status: 201, description: 'Documento(s) recebido(s) e processado(s).', type: [FiscalDocumentResponseDto] })
  @ApiResponse({ status: 400, description: 'Arquivo ausente ou em formato inválido.' })
  async uploadXml(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ControllerResponse<FiscalDocumentResponseDto[]>> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo XML foi enviado. Utilize o campo "arquivo".');
    }

    const usuario = await this.usersService.findById(currentUser.id);
    const documentos = await this.fiscalService.processarUpload(usuario.companyId, usuario.id, file);

    const mensagem =
      documentos.length > 1
        ? `${documentos.length} notas encontradas no arquivo e processadas com sucesso.`
        : 'Documento fiscal processado com sucesso.';

    return buildResponse(documentos as unknown as FiscalDocumentResponseDto[], mensagem);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os documentos fiscais enviados pela empresa do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.', type: [FiscalDocumentResponseDto] })
  async listar(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ControllerResponse<FiscalDocumentResponseDto[]>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const documentos = await this.fiscalService.listarPorEmpresa(usuario.companyId);
    return buildResponse(documentos as unknown as FiscalDocumentResponseDto[], 'Documentos fiscais listados com sucesso.');
  }

  @Get('historico/analises')
  @ApiOperation({ summary: 'Lista o histórico de análises de IA já executadas pela empresa do usuário logado' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
  async listarHistorico(@CurrentUser() currentUser: AuthenticatedUser): Promise<ControllerResponse<unknown[]>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const historico = await this.fiscalService.listarHistoricoAnalises(usuario.companyId);
    return buildResponse(historico, 'Histórico de análises listado com sucesso.');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna a análise fiscal de um documento específico' })
  @ApiResponse({ status: 200, description: 'Documento retornado com sucesso.', type: FiscalDocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  async buscarPorId(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ControllerResponse<FiscalDocumentResponseDto>> {
    const usuario = await this.usersService.findById(currentUser.id);
    const documento = await this.fiscalService.buscarPorId(usuario.companyId, id);
    return buildResponse(documento as unknown as FiscalDocumentResponseDto, 'Documento fiscal obtido com sucesso.');
  }
}
