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
exports.ClientesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const response_util_1 = require("../common/utils/response.util");
const users_service_1 = require("../users/users.service");
const clientes_service_1 = require("./clientes.service");
const create_cliente_dto_1 = require("./dto/create-cliente.dto");
const update_cliente_dto_1 = require("./dto/update-cliente.dto");
let ClientesController = class ClientesController {
    constructor(clientesService, usersService) {
        this.clientesService = clientesService;
        this.usersService = usersService;
    }
    async criar(currentUser, dto) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cliente = await this.clientesService.criar(usuario.companyId, dto);
        return (0, response_util_1.buildResponse)(cliente, 'Cliente cadastrado com sucesso.');
    }
    async listar(currentUser, busca) {
        const usuario = await this.usersService.findById(currentUser.id);
        const clientes = await this.clientesService.listar(usuario.companyId, busca);
        return (0, response_util_1.buildResponse)(clientes, 'Clientes listados com sucesso.');
    }
    async buscarPorId(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cliente = await this.clientesService.buscarPorId(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(cliente);
    }
    async atualizar(currentUser, id, dto) {
        const usuario = await this.usersService.findById(currentUser.id);
        const cliente = await this.clientesService.atualizar(usuario.companyId, id, dto);
        return (0, response_util_1.buildResponse)(cliente, 'Cliente atualizado com sucesso.');
    }
    async excluir(currentUser, id) {
        const usuario = await this.usersService.findById(currentUser.id);
        const resultado = await this.clientesService.excluir(usuario.companyId, id);
        return (0, response_util_1.buildResponse)(resultado, 'Cliente excluído com sucesso.');
    }
};
exports.ClientesController = ClientesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra um novo cliente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente criado com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cliente_dto_1.CreateClienteDto]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista os clientes da empresa, com pesquisa opcional' }),
    (0, swagger_1.ApiQuery)({ name: 'busca', required: false, description: 'Pesquisa por nome, empresa, CPF/CNPJ ou e-mail' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('busca')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um cliente pelo ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "buscarPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edita um cliente existente' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_cliente_dto_1.UpdateClienteDto]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Exclui um cliente' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClientesController.prototype, "excluir", null);
exports.ClientesController = ClientesController = __decorate([
    (0, swagger_1.ApiTags)('Clientes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('clientes'),
    __metadata("design:paramtypes", [clientes_service_1.ClientesService,
        users_service_1.UsersService])
], ClientesController);
//# sourceMappingURL=clientes.controller.js.map