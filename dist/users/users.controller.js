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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const multer_config_1 = require("../config/multer.config");
const response_util_1 = require("../common/utils/response.util");
const change_password_dto_1 = require("./dto/change-password.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        return (0, response_util_1.buildResponse)(this.usersService.toProfileDto(usuario), 'Perfil obtido com sucesso.');
    }
    async updateProfile(currentUser, dto) {
        const usuario = await this.usersService.updateProfile(currentUser.id, dto);
        return (0, response_util_1.buildResponse)(this.usersService.toProfileDto(usuario), 'Perfil atualizado com sucesso.');
    }
    async changePassword(currentUser, dto) {
        await this.usersService.changePassword(currentUser.id, dto);
        return (0, response_util_1.buildResponse)(null, 'Senha alterada com sucesso.');
    }
    async uploadAvatar(currentUser, file) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado.');
        }
        const avatarPath = `/uploads/avatars/${file.filename}`;
        const usuario = await this.usersService.updateAvatar(currentUser.id, avatarPath);
        return (0, response_util_1.buildResponse)(this.usersService.toProfileDto(usuario), 'Avatar atualizado com sucesso.');
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna o perfil do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil retornado com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza o perfil do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil atualizado com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Altera a senha do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Senha alterada com sucesso.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('me/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multer_config_1.avatarUploadOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Envia (upload) um novo avatar para o usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar atualizado com sucesso.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Arquivo ausente ou em formato inválido.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map