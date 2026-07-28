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
exports.DashboardResumoDto = exports.LoginRecenteDto = exports.UploadRecenteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UploadRecenteDto {
}
exports.UploadRecenteDto = UploadRecenteDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UploadRecenteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UploadRecenteDto.prototype, "nomeArquivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UploadRecenteDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UploadRecenteDto.prototype, "criadoEm", void 0);
class LoginRecenteDto {
}
exports.LoginRecenteDto = LoginRecenteDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoginRecenteDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoginRecenteDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], LoginRecenteDto.prototype, "ultimoLogin", void 0);
class DashboardResumoDto {
}
exports.DashboardResumoDto = DashboardResumoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade total de usuários cadastrados' }),
    __metadata("design:type", Number)
], DashboardResumoDto.prototype, "totalUsuarios", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade total de empresas distintas cadastradas' }),
    __metadata("design:type", Number)
], DashboardResumoDto.prototype, "totalEmpresas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade de arquivos XML enviados (placeholder até o módulo de uploads existir)' }),
    __metadata("design:type", Number)
], DashboardResumoDto.prototype, "totalXmlEnviados", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade de análises realizadas (placeholder até o módulo de análises existir)' }),
    __metadata("design:type", Number)
], DashboardResumoDto.prototype, "totalAnalises", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade de pendências abertas (placeholder até o módulo existir)' }),
    __metadata("design:type", Number)
], DashboardResumoDto.prototype, "totalPendencias", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'Lista de empresas cadastradas no sistema' }),
    __metadata("design:type", Array)
], DashboardResumoDto.prototype, "empresas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UploadRecenteDto] }),
    __metadata("design:type", Array)
], DashboardResumoDto.prototype, "ultimosUploads", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [LoginRecenteDto] }),
    __metadata("design:type", Array)
], DashboardResumoDto.prototype, "ultimosLogins", void 0);
//# sourceMappingURL=dashboard-resumo.dto.js.map