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
exports.FiscalController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
const users_service_1 = require("../users/users.service");
const fiscal_service_1 = require("./fiscal.service");
const fiscal_multer_config_1 = require("./config/fiscal-multer.config");
const fiscal_document_response_dto_1 = require("./dto/fiscal-document-response.dto");
let FiscalController = class FiscalController {
    constructor(fiscalService, usersService) {
        this.fiscalService = fiscalService;
        this.usersService = usersService;
    }
    async uploadXml(currentUser, file) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo XML foi enviado. Utilize o campo "arquivo".');
        }
        const usuario = await this.usersService.findById(currentUser.id);
        const documento = await this.fiscalService.processarUpload(usuario.companyId, usuario.id, file);
        return (0, response_util_1.buildResponse)(documento, 'Documento fiscal processado com sucesso.');
    }
    async listar(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        const documentos = await this.fiscalService.listarPorEmpresa(usuario.companyId);
        return (0, response_util_1.buildResponse)(documentos, 'Documentos fiscais listados com sucesso.');
    }
    async listarHistorico(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        const historico = await this.fiscalService.listarHistoricoAnalises(usuario.companyId);
        return (0, response_util_1.buildResponse)(historico, 'Histórico de análises listado com sucesso.');
    }
    async buscarPorId(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const documento = await this.fiscalService.buscarPorId(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(documento, 'Documento fiscal obtido com sucesso.');
    }
};
exports.FiscalController = FiscalController;
__decorate([
    (0, common_1.Post)('upload-xml'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('arquivo', fiscal_multer_config_1.fiscalXmlUploadOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Envia um arquivo XML de NFe para processamento' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Documento recebido e processado.', type: fiscal_document_response_dto_1.FiscalDocumentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo ausente ou em formato inválido.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FiscalController.prototype, "uploadXml", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista os documentos fiscais enviados pela empresa do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista retornada com sucesso.', type: [fiscal_document_response_dto_1.FiscalDocumentResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FiscalController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('historico/analises'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista o histórico de análises de IA já executadas pela empresa do usuário logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Histórico retornado com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FiscalController.prototype, "listarHistorico", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna a análise fiscal de um documento específico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documento retornado com sucesso.', type: fiscal_document_response_dto_1.FiscalDocumentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Documento não encontrado.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FiscalController.prototype, "buscarPorId", null);
exports.FiscalController = FiscalController = __decorate([
    (0, swagger_1.ApiTags)('Fiscal'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('fiscal'),
    __metadata("design:paramtypes", [fiscal_service_1.FiscalService,
        users_service_1.UsersService])
], FiscalController);
//# sourceMappingURL=fiscal.controller.js.map