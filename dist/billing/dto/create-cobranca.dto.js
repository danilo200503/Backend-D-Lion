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
exports.CreateCobrancaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const STATUS_VALIDOS = ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'];
class CreateCobrancaDto {
}
exports.CreateCobrancaDto = CreateCobrancaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a2c13519-b749-41b4-bc3c-ab64f6a9593d' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCobrancaDto.prototype, "clienteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Honorários contábeis - Julho/2026' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A descrição da cobrança é obrigatória.' }),
    __metadata("design:type", String)
], CreateCobrancaDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: 'O valor da cobrança deve ser maior que zero.' }),
    __metadata("design:type", Number)
], CreateCobrancaDto.prototype, "valor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-10' }),
    (0, class_validator_1.IsISO8601)({ strict: false }, { message: 'Informe uma data de vencimento válida (AAAA-MM-DD).' }),
    __metadata("design:type", String)
], CreateCobrancaDto.prototype, "vencimento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: STATUS_VALIDOS, required: false, default: 'PENDENTE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(STATUS_VALIDOS, { message: 'Status inválido.' }),
    __metadata("design:type", Object)
], CreateCobrancaDto.prototype, "status", void 0);
//# sourceMappingURL=create-cobranca.dto.js.map