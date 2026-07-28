"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
const users_service_1 = require("../users/users.service");
const fiscal_service_1 = require("../fiscal/fiscal.service");
const ai_service_1 = require("./ai.service");
const analisar_documento_dto_1 = require("./dto/analisar-documento.dto");
const resultado_analise_dto_1 = require("./dto/resultado-analise.dto");
let AiController = class AiController {
    constructor(aiService, fiscalService, usersService) {
        this.aiService = aiService;
        this.fiscalService = fiscalService;
        this.usersService = usersService;
    }
    async analisar(currentUser, dto) {
        const usuario = await this.usersService.findById(currentUser.id);
        const documento = await this.fiscalService.buscarPorId(usuario.companyId, dto.xmlId);
        const documentoParaAnalise = {
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
            itens: (documento.itens ?? []),
        };
        const resultado = this.aiService.analisarDocumento(documento.id, documentoParaAnalise);
        await this.fiscalService.salvarResultadoAnalise(usuario.companyId, documento.id, resultado);
        return (0, response_util_1.buildResponse)(resultado, 'Análise fiscal concluída com sucesso.');
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('analisar'),
    (0, swagger_1.ApiOperation)({ summary: 'Executa a análise fiscal (Score Fiscal + inconsistências) de um documento já enviado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Análise concluída com sucesso.', type: resultado_analise_dto_1.ResultadoAnaliseFiscalDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Documento fiscal não encontrado.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analisar_documento_dto_1.AnalisarDocumentoDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analisar", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        fiscal_service_1.FiscalService,
        users_service_1.UsersService])
], AiController);
//# sourceMappingURL=ai.controller.js.map