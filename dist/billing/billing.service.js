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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const whatsapp_link_util_1 = require("./utils/whatsapp-link.util");
let BillingService = class BillingService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async criar(companyId, dto) {
        await this.garantirClienteDaEmpresa(companyId, dto.clienteId);
        return this.prisma.cobranca.create({
            data: {
                companyId,
                clienteId: dto.clienteId,
                descricao: dto.descricao,
                valor: dto.valor,
                vencimento: new Date(dto.vencimento),
                status: dto.status ?? 'PENDENTE',
            },
        });
    }
    async listar(companyId, filtros) {
        return this.prisma.cobranca.findMany({
            where: {
                companyId,
                ...(filtros.status ? { status: filtros.status } : {}),
                ...(filtros.clienteId ? { clienteId: filtros.clienteId } : {}),
            },
            include: { cliente: true },
            orderBy: { vencimento: 'asc' },
        });
    }
    async buscarPorId(companyId, id) {
        const cobranca = await this.prisma.cobranca.findFirst({
            where: { id, companyId },
            include: { cliente: true },
        });
        if (!cobranca) {
            throw new common_1.NotFoundException('Cobrança não encontrada.');
        }
        return cobranca;
    }
    async atualizar(companyId, id, dto) {
        await this.buscarPorId(companyId, id);
        if (dto.clienteId) {
            await this.garantirClienteDaEmpresa(companyId, dto.clienteId);
        }
        return this.prisma.cobranca.update({
            where: { id },
            data: {
                ...dto,
                vencimento: dto.vencimento ? new Date(dto.vencimento) : undefined,
            },
        });
    }
    async excluir(companyId, id) {
        await this.buscarPorId(companyId, id);
        await this.prisma.cobranca.delete({ where: { id } });
        return { removido: true };
    }
    async resumo(companyId) {
        const [total, pendentes, pagas, atrasadas] = await Promise.all([
            this.prisma.cobranca.count({ where: { companyId } }),
            this.prisma.cobranca.count({ where: { companyId, status: 'PENDENTE' } }),
            this.prisma.cobranca.count({ where: { companyId, status: 'PAGA' } }),
            this.prisma.cobranca.count({ where: { companyId, status: 'ATRASADA' } }),
        ]);
        return { total, pendentes, pagas, atrasadas };
    }
    async enviarPorEmail(companyId, cobrancaId) {
        const cobranca = await this.buscarPorId(companyId, cobrancaId);
        if (!cobranca.cliente.email) {
            throw new common_1.BadRequestException('Este cliente não possui e-mail cadastrado.');
        }
        await this.emailService.enviarCobranca({
            destinatarioEmail: cobranca.cliente.email,
            destinatarioNome: cobranca.cliente.nome,
            empresa: cobranca.cliente.empresa ?? cobranca.cliente.nome,
            descricao: cobranca.descricao,
            valor: cobranca.valor,
            vencimento: cobranca.vencimento,
        });
        await this.prisma.billingHistory.create({
            data: { cobrancaId, tipoEnvio: 'EMAIL' },
        });
        return this.prisma.cobranca.update({
            where: { id: cobrancaId },
            data: { status: 'ENVIADA', dataEnvio: new Date() },
        });
    }
    async gerarLinkWhatsapp(companyId, cobrancaId) {
        const cobranca = await this.buscarPorId(companyId, cobrancaId);
        if (!cobranca.cliente.telefone) {
            throw new common_1.BadRequestException('Este cliente não possui telefone cadastrado.');
        }
        const mensagem = (0, whatsapp_link_util_1.montarMensagemCobranca)({
            descricao: cobranca.descricao,
            valor: cobranca.valor,
            vencimento: cobranca.vencimento,
        });
        const link = (0, whatsapp_link_util_1.montarLinkWhatsapp)(cobranca.cliente.telefone, mensagem);
        await this.prisma.billingHistory.create({
            data: { cobrancaId, tipoEnvio: 'WHATSAPP' },
        });
        await this.prisma.cobranca.update({
            where: { id: cobrancaId },
            data: { status: 'ENVIADA', dataEnvio: new Date() },
        });
        return { link, mensagem };
    }
    async listarHistorico(companyId, filtros) {
        return this.prisma.billingHistory.findMany({
            where: {
                cobranca: {
                    companyId,
                    ...(filtros.clienteId ? { clienteId: filtros.clienteId } : {}),
                },
                ...(filtros.tipoEnvio ? { tipoEnvio: filtros.tipoEnvio } : {}),
                ...(filtros.dataInicio || filtros.dataFim
                    ? {
                        dataEnvio: {
                            ...(filtros.dataInicio ? { gte: new Date(filtros.dataInicio) } : {}),
                            ...(filtros.dataFim ? { lte: new Date(filtros.dataFim) } : {}),
                        },
                    }
                    : {}),
            },
            include: { cobranca: { include: { cliente: true } } },
            orderBy: { dataEnvio: 'desc' },
        });
    }
    async garantirClienteDaEmpresa(companyId, clienteId) {
        const cliente = await this.prisma.cliente.findFirst({ where: { id: clienteId, companyId } });
        if (!cliente) {
            throw new common_1.NotFoundException('Cliente não encontrado.');
        }
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], BillingService);
//# sourceMappingURL=billing.service.js.map