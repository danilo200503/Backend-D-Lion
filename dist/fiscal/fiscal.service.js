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
var FiscalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiscalService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const prisma_service_1 = require("../database/prisma.service");
const nfe_xml_parser_1 = require("./utils/nfe-xml-parser");
let FiscalService = FiscalService_1 = class FiscalService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FiscalService_1.name);
    }
    async processarUpload(companyId, uploadedById, file) {
        const documento = await this.prisma.fiscalDocument.create({
            data: {
                companyId,
                uploadedById,
                nomeArquivo: file.originalname,
                caminhoArquivo: file.path,
                status: 'PROCESSANDO',
            },
        });
        try {
            const conteudo = await (0, promises_1.readFile)(file.path, 'utf-8');
            const dados = (0, nfe_xml_parser_1.extrairDadosNfe)(conteudo);
            return await this.prisma.fiscalDocument.update({
                where: { id: documento.id },
                data: {
                    status: 'CONCLUIDO',
                    tipoDocumento: dados.tipoDocumento,
                    empresa: dados.empresa,
                    cnpj: dados.cnpj,
                    numeroNota: dados.numeroNota,
                    serie: dados.serie,
                    chaveAcesso: dados.chaveAcesso,
                    dataEmissao: dados.dataEmissao ? new Date(dados.dataEmissao) : undefined,
                    destinatario: dados.destinatario,
                    destinatarioCnpj: dados.destinatarioCnpj,
                    destinatarioUf: dados.destinatarioUf,
                    municipio: dados.municipio,
                    uf: dados.uf,
                    indicadorIE: dados.indicadorIE,
                    valorTotal: dados.valorTotal,
                    impostos: dados.impostos,
                    itens: dados.itens,
                    alertas: dados.alertas,
                    erros: [],
                    recomendacoes: [],
                },
            });
        }
        catch (error) {
            const mensagem = error instanceof Error ? error.message : 'Falha desconhecida ao processar o XML.';
            this.logger.warn(`Falha ao processar XML fiscal ${file.originalname}: ${mensagem}`);
            return this.prisma.fiscalDocument.update({
                where: { id: documento.id },
                data: {
                    status: 'ERRO',
                    mensagemErro: mensagem,
                    erros: [mensagem],
                },
            });
        }
    }
    async listarPorEmpresa(companyId) {
        return this.prisma.fiscalDocument.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async buscarPorId(companyId, id) {
        const documento = await this.prisma.fiscalDocument.findFirst({
            where: { id, companyId },
        });
        if (!documento) {
            throw new common_1.NotFoundException('Documento fiscal não encontrado.');
        }
        return documento;
    }
    async salvarResultadoAnalise(companyId, documentoId, resultado) {
        await this.buscarPorId(companyId, documentoId);
        await this.prisma.fiscalDocument.update({
            where: { id: documentoId },
            data: {
                scoreFiscal: resultado.score,
                classificacao: resultado.classificacao,
                erros: resultado.erros,
            },
        });
        return this.prisma.fiscalAnalysis.create({
            data: {
                documentId: documentoId,
                companyId,
                scoreFiscal: resultado.score,
                classificacao: resultado.classificacao,
                erros: resultado.erros,
                totalErros: resultado.totalErros,
            },
        });
    }
    async listarHistoricoAnalises(companyId) {
        return this.prisma.fiscalAnalysis.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            include: { document: true },
        });
    }
};
exports.FiscalService = FiscalService;
exports.FiscalService = FiscalService = FiscalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FiscalService);
//# sourceMappingURL=fiscal.service.js.map