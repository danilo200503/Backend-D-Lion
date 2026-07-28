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
exports.CompanyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const response_util_1 = require("../common/utils/response.util");
const users_service_1 = require("../users/users.service");
const company_service_1 = require("./company.service");
const company_response_dto_1 = require("./dto/company-response.dto");
const create_company_dto_1 = require("./dto/create-company.dto");
const update_company_dto_1 = require("./dto/update-company.dto");
let CompanyController = class CompanyController {
    constructor(companyService, usersService) {
        this.companyService = companyService;
        this.usersService = usersService;
    }
    async findAll() {
        const empresas = await this.companyService.findAll();
        const dtos = empresas.map((empresa) => this.companyService.toResponseDto(empresa));
        return (0, response_util_1.buildResponse)(dtos, 'Empresas listadas com sucesso.');
    }
    async findMe(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        return (0, response_util_1.buildResponse)(this.companyService.toResponseDto(usuario.company), 'Empresa obtida com sucesso.');
    }
    async findById(id) {
        const empresa = await this.companyService.findById(id);
        return (0, response_util_1.buildResponse)(this.companyService.toResponseDto(empresa), 'Empresa obtida com sucesso.');
    }
    async create(dto) {
        const empresa = await this.companyService.create(dto);
        return (0, response_util_1.buildResponse)(this.companyService.toResponseDto(empresa), 'Empresa cadastrada com sucesso.');
    }
    async update(id, dto) {
        const empresa = await this.companyService.update(id, dto);
        return (0, response_util_1.buildResponse)(this.companyService.toResponseDto(empresa), 'Empresa atualizada com sucesso.');
    }
    async remove(id) {
        await this.companyService.remove(id);
        return (0, response_util_1.buildResponse)(null, 'Empresa removida com sucesso.');
    }
};
exports.CompanyController = CompanyController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todas as empresas cadastradas (somente Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de empresas retornada com sucesso.', type: [company_response_dto_1.CompanyResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna os dados da empresa do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Empresa retornada com sucesso.', type: company_response_dto_1.CompanyResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findMe", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna uma empresa pelo id (somente Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Empresa retornada com sucesso.', type: company_response_dto_1.CompanyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Empresa não encontrada.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra uma nova empresa (somente Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Empresa cadastrada com sucesso.', type: company_response_dto_1.CompanyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CNPJ já cadastrado.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_dto_1.CreateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza uma empresa existente (somente Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Empresa atualizada com sucesso.', type: company_response_dto_1.CompanyResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Empresa não encontrada.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CNPJ já cadastrado por outra empresa.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_company_dto_1.UpdateCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove uma empresa sem usuários vinculados (somente Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Empresa removida com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Empresa não encontrada.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Empresa possui usuários vinculados.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompanyController.prototype, "remove", null);
exports.CompanyController = CompanyController = __decorate([
    (0, swagger_1.ApiTags)('Company'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('company'),
    __metadata("design:paramtypes", [company_service_1.CompanyService,
        users_service_1.UsersService])
], CompanyController);
//# sourceMappingURL=company.controller.js.map