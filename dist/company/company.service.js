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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const company_response_dto_1 = require("./dto/company-response.dto");
let CompanyService = class CompanyService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async findAll() {
        return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
    }
    async findById(id) {
        const empresa = await this.prisma.company.findUnique({ where: { id } });
        if (!empresa) {
            throw new common_1.NotFoundException('Empresa não encontrada.');
        }
        return empresa;
    }
    async create(dto) {
        const empresaExistente = await this.prisma.company.findUnique({
            where: { cnpj: dto.cnpj },
        });
        if (empresaExistente) {
            throw new common_1.ConflictException('Já existe uma empresa cadastrada com este CNPJ.');
        }
        const empresa = await this.prisma.company.create({ data: dto });
        this.logger.log(`Empresa cadastrada: ${empresa.name} (${empresa.cnpj})`, 'CompanyService');
        return empresa;
    }
    async update(id, dto) {
        await this.findById(id);
        if (dto.cnpj) {
            const empresaComMesmoCnpj = await this.prisma.company.findUnique({
                where: { cnpj: dto.cnpj },
            });
            if (empresaComMesmoCnpj && empresaComMesmoCnpj.id !== id) {
                throw new common_1.ConflictException('Já existe uma empresa cadastrada com este CNPJ.');
            }
        }
        const empresa = await this.prisma.company.update({ where: { id }, data: dto });
        this.logger.log(`Empresa atualizada: ${empresa.id}`, 'CompanyService');
        return empresa;
    }
    async remove(id) {
        await this.findById(id);
        const totalUsuariosVinculados = await this.prisma.user.count({ where: { companyId: id } });
        if (totalUsuariosVinculados > 0) {
            throw new common_1.ConflictException('Não é possível remover a empresa: existem usuários vinculados a ela.');
        }
        await this.prisma.company.delete({ where: { id } });
        this.logger.log(`Empresa removida: ${id}`, 'CompanyService');
    }
    toResponseDto(empresa, totalUsuarios) {
        const dto = new company_response_dto_1.CompanyResponseDto();
        dto.id = empresa.id;
        dto.name = empresa.name;
        dto.cnpj = empresa.cnpj;
        dto.totalUsuarios = totalUsuarios;
        dto.createdAt = empresa.createdAt;
        dto.updatedAt = empresa.updatedAt;
        return dto;
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], CompanyService);
//# sourceMappingURL=company.service.js.map