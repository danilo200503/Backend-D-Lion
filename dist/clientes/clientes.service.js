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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ClientesService = class ClientesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criar(companyId, dto) {
        return this.prisma.cliente.create({
            data: { ...dto, companyId },
        });
    }
    async listar(companyId, busca) {
        return this.prisma.cliente.findMany({
            where: {
                companyId,
                ...(busca
                    ? {
                        OR: [
                            { nome: { contains: busca, mode: 'insensitive' } },
                            { empresa: { contains: busca, mode: 'insensitive' } },
                            { cpfCnpj: { contains: busca, mode: 'insensitive' } },
                            { email: { contains: busca, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            orderBy: { criadoEm: 'desc' },
        });
    }
    async buscarPorId(companyId, id) {
        const cliente = await this.prisma.cliente.findFirst({ where: { id, companyId } });
        if (!cliente) {
            throw new common_1.NotFoundException('Cliente não encontrado.');
        }
        return cliente;
    }
    async atualizar(companyId, id, dto) {
        await this.buscarPorId(companyId, id);
        return this.prisma.cliente.update({ where: { id }, data: dto });
    }
    async excluir(companyId, id) {
        await this.buscarPorId(companyId, id);
        await this.prisma.cliente.delete({ where: { id } });
        return { removido: true };
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map