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
exports.AuthResponseDto = exports.UsuarioAutenticadoDto = exports.EmpresaAutenticadaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EmpresaAutenticadaDto {
}
exports.EmpresaAutenticadaDto = EmpresaAutenticadaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EmpresaAutenticadaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EmpresaAutenticadaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EmpresaAutenticadaDto.prototype, "cnpj", void 0);
class UsuarioAutenticadoDto {
}
exports.UsuarioAutenticadoDto = UsuarioAutenticadoDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UsuarioAutenticadoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UsuarioAutenticadoDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UsuarioAutenticadoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: EmpresaAutenticadaDto }),
    __metadata("design:type", EmpresaAutenticadaDto)
], UsuarioAutenticadoDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], UsuarioAutenticadoDto.prototype, "permissoes", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UsuarioAutenticadoDto }),
    __metadata("design:type", UsuarioAutenticadoDto)
], AuthResponseDto.prototype, "usuario", void 0);
//# sourceMappingURL=auth-response.dto.js.map