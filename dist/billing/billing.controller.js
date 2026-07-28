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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
const users_service_1 = require("../users/users.service");
const billing_service_1 = require("./billing.service");
const create_cobranca_dto_1 = require("./dto/create-cobranca.dto");
const update_cobranca_dto_1 = require("./dto/update-cobranca.dto");
let BillingController = class BillingController {
    constructor(billingService, usersService) {
        this.billingService = billingService;
        this.usersService = usersService;
    }
    async criar(currentUser, dto) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cobranca = await this.billingService.criar(usuario.companyId, dto);
        return (0, response_util_1.buildResponse)(cobranca, 'Cobrança criada com sucesso.');
    }
    async listar(currentUser, status, clienteId) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cobrancas = await this.billingService.listar(usuario.companyId, { status, clienteId });
        return (0, response_util_1.buildResponse)(cobrancas, 'Cobranças listadas com sucesso.');
    }
    async resumo(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        const resumo = await this.billingService.resumo(usuario.companyId);
        return (0, response_util_1.buildResponse)(resumo, 'Resumo de cobranças obtido com sucesso.');
    }
    async historico(currentUser, clienteId, tipoEnvio, dataInicio, dataFim) {
        const usuario = await this.usersService.findById(currentUser.id);
        const historico = await this.billingService.listarHistorico(usuario.companyId, {
            clienteId,
            tipoEnvio,
            dataInicio,
            dataFim,
        });
        return (0, response_util_1.buildResponse)(historico, 'Histórico de envios listado com sucesso.');
    }
    async buscarPorId(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cobranca = await this.billingService.buscarPorId(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(cobranca);
    }
    async atualizar(currentUser, id, dto) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cobranca = await this.billingService.atualizar(usuario.companyId, id, dto);
        return (0, response_util_1.buildResponse)(cobranca, 'Cobrança atualizada com sucesso.');
    }
    async excluir(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const resultado = await this.billingService.excluir(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(resultado, 'Cobrança excluída com sucesso.');
    }
    async enviarEmail(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        await this.billingService.enviarPorEmail(usuario.companyId, id);
        return { success: true };
    }
    async enviarWhatsapp(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const resultado = await this.billingService.gerarLinkWhatsapp(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(resultado, 'Link do WhatsApp gerado com sucesso.');
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria uma nova cobrança' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cobranca_dto_1.CreateCobrancaDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista as cobranças da empresa, com filtros opcionais' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'] }),
    (0, swagger_1.ApiQuery)({ name: 'clienteId', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('clienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('resumo'),
    (0, swagger_1.ApiOperation)({ summary: 'Indicadores de cobranças para os cards do Dashboard' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "resumo", null);
__decorate([
    (0, common_1.Get)('historico'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de envios de cobrança (e-mail/WhatsApp)' }),
    (0, swagger_1.ApiQuery)({ name: 'clienteId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'tipoEnvio', required: false, enum: ['EMAIL', 'WHATSAPP'] }),
    (0, swagger_1.ApiQuery)({ name: 'dataInicio', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'dataFim', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('clienteId')),
    __param(2, (0, common_1.Query)('tipoEnvio')),
    __param(3, (0, common_1.Query)('dataInicio')),
    __param(4, (0, common_1.Query)('dataFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "historico", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca uma cobrança pelo ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edita uma cobrança existente' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_cobranca_dto_1.UpdateCobrancaDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Exclui uma cobrança' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "excluir", null);
__decorate([
    (0, common_1.Post)('send-email/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Envia a cobrança por e-mail e atualiza o status para ENVIADA' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'E-mail enviado com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "enviarEmail", null);
__decorate([
    (0, common_1.Post)('send-whatsapp/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Gera o link do WhatsApp (wa.me) com a mensagem pré-preenchida e registra o envio no histórico',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "enviarWhatsapp", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService,
        users_service_1.UsersService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map