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
exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Maria Silva', description: 'Nome completo do usuário' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'maria.silva@empresa.com.br' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Informe um e-mail válido.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: 'Qualquer senha com no mínimo 4 caracteres' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4, { message: 'A senha deve possuir no mínimo 4 caracteres.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "senha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'b3f1a2c4-1234-4a5b-9c8d-1234567890ab',
        description: 'Id da empresa já cadastrada (opcional). Se não for informado, uma nova empresa é criada automaticamente para o usuário.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'O id da empresa (companyId) deve ser um UUID válido.' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Minha Empresa LTDA', required: false, description: 'Nome da nova empresa, usado apenas quando companyId não é informado.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "nomeEmpresa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Analista Contábil', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "cargo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+55 71 99999-0000', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "telefone", void 0);
//# sourceMappingURL=register.dto.js.map