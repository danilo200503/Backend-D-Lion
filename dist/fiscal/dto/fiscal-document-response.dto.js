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
exports.FiscalDocumentResponseDto = exports.ImpostoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class ImpostoDto {
}
exports.ImpostoDto = ImpostoDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ImpostoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ImpostoDto.prototype, "valor", void 0);
let FiscalDocumentResponseDto = class FiscalDocumentResponseDto {
};
exports.FiscalDocumentResponseDto = FiscalDocumentResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "nomeArquivo", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ enum: ['PROCESSANDO', 'CONCLUIDO', 'ERRO'] }),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "empresa", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "cnpj", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "numeroNota", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], FiscalDocumentResponseDto.prototype, "valorTotal", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: [ImpostoDto], required: false }),
    __metadata("design:type", Array)
], FiscalDocumentResponseDto.prototype, "impostos", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: [String], required: false }),
    __metadata("design:type", Array)
], FiscalDocumentResponseDto.prototype, "erros", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: [String], required: false }),
    __metadata("design:type", Array)
], FiscalDocumentResponseDto.prototype, "alertas", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ type: [String], required: false }),
    __metadata("design:type", Array)
], FiscalDocumentResponseDto.prototype, "recomendacoes", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], FiscalDocumentResponseDto.prototype, "mensagemErro", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], FiscalDocumentResponseDto.prototype, "createdAt", void 0);
exports.FiscalDocumentResponseDto = FiscalDocumentResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], FiscalDocumentResponseDto);
//# sourceMappingURL=fiscal-document-response.dto.js.map