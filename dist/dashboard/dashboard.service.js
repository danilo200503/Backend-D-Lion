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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const LIMITE_ULTIMOS_LOGINS = 5;
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterResumo() {
        const [totalUsuarios, empresasCadastradas, ultimosLogins] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.company.findMany({ select: { name: true } }),
            this.prisma.user.findMany({
                where: { ultimoLogin: { not: null } },
                orderBy: { ultimoLogin: 'desc' },
                take: LIMITE_ULTIMOS_LOGINS,
                select: { nome: true, email: true, ultimoLogin: true },
            }),
        ]);
        const empresas = empresasCadastradas.map((empresa) => empresa.name);
        return {
            totalUsuarios,
            totalEmpresas: empresas.length,
            totalXmlEnviados: 0,
            totalAnalises: 0,
            totalPendencias: 0,
            empresas,
            ultimosUploads: [],
            ultimosLogins: ultimosLogins.map((login) => ({
                usuario: login.nome,
                email: login.email,
                ultimoLogin: login.ultimoLogin,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map