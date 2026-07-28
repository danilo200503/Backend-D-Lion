"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const fiscal_rules_1 = require("./rules/fiscal-rules");
const SCORE_INICIAL = 100;
const SCORE_MINIMO = 0;
let AiService = class AiService {
    analisarDocumento(documentoId, documento) {
        const erros = fiscal_rules_1.TODAS_AS_REGRAS.flatMap((regra) => regra(documento));
        const score = this.calcularScore(erros);
        const classificacao = this.classificar(score);
        return {
            documentoId,
            score,
            classificacao,
            totalErros: erros.length,
            erros,
        };
    }
    calcularScore(erros) {
        const totalPontosPerdidos = erros.reduce((total, erro) => total + erro.pontosPerdidos, 0);
        return Math.max(SCORE_MINIMO, SCORE_INICIAL - totalPontosPerdidos);
    }
    classificar(score) {
        if (score >= 95)
            return 'Excelente';
        if (score >= 80)
            return 'Boa';
        if (score >= 60)
            return 'Regular';
        return 'Ruim';
    }
    explicarErro(erro) {
        return `${erro.explicacao} Como corrigir: ${erro.correcao}`;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map