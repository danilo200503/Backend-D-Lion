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
exports.AnalisarDocumentoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AnalisarDocumentoDto {
}
exports.AnalisarDocumentoDto = AnalisarDocumentoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do documento fiscal (XML) já enviado via /fiscal/upload-xml', example: 'a2c13519-b749-41b4-bc3c-ab64f6a9593d' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AnalisarDocumentoDto.prototype, "xmlId", void 0);
//# sourceMappingURL=analisar-documento.dto.js.map