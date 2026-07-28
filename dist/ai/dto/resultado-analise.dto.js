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
exports.ResultadoAnaliseFiscalDto = exports.ErroFiscalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ErroFiscalDto {
}
exports.ErroFiscalDto = ErroFiscalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErroFiscalDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErroFiscalDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErroFiscalDto.prototype, "explicacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ErroFiscalDto.prototype, "correcao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ALTA', 'MEDIA', 'BAIXA'] }),
    __metadata("design:type", String)
], ErroFiscalDto.prototype, "severidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ErroFiscalDto.prototype, "pontosPerdidos", void 0);
class ResultadoAnaliseFiscalDto {
}
exports.ResultadoAnaliseFiscalDto = ResultadoAnaliseFiscalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ResultadoAnaliseFiscalDto.prototype, "documentoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0, maximum: 100 }),
    __metadata("design:type", Number)
], ResultadoAnaliseFiscalDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Excelente', 'Boa', 'Regular', 'Ruim'] }),
    __metadata("design:type", String)
], ResultadoAnaliseFiscalDto.prototype, "classificacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ResultadoAnaliseFiscalDto.prototype, "totalErros", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ErroFiscalDto] }),
    __metadata("design:type", Array)
], ResultadoAnaliseFiscalDto.prototype, "erros", void 0);
//# sourceMappingURL=resultado-analise.dto.js.map