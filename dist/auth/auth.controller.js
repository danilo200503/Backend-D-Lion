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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const public_decorator_1 = require("./decorators/public.decorator");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const register_response_dto_1 = require("./dto/register-response.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const verify_email_dto_1 = require("./dto/verify-email.dto");
const resend_verification_dto_1 = require("./dto/resend-verification.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const register_dto_1 = require("./dto/register.dto");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const user_profile_dto_1 = require("../users/dto/user-profile.dto");
const response_util_1 = require("../common/utils/response.util");
const app_config_service_1 = require("../config/app-config.service");
let AuthController = class AuthController {
    constructor(authService, usersService, configService) {
        this.authService = authService;
        this.usersService = usersService;
        this.configService = configService;
    }
    async register(dto) {
        const resultado = await this.authService.register(dto);
        return (0, response_util_1.buildResponse)(resultado, 'Cadastro realizado. Verifique seu e-mail para ativar a conta.');
    }
    async verificarEmail(dto) {
        const resultado = await this.authService.verificarEmail(dto.token);
        return (0, response_util_1.buildResponse)(resultado, 'E-mail verificado com sucesso.');
    }
    async reenviarVerificacao(dto) {
        await this.authService.reenviarVerificacao(dto.email);
        return (0, response_util_1.buildResponse)(null, 'Se o e-mail existir e ainda não estiver verificado, um novo link foi enviado.');
    }
    async esqueciSenha(dto) {
        await this.authService.esqueciSenha(dto.email);
        return (0, response_util_1.buildResponse)(null, 'Se o e-mail existir em nossa base, enviamos as instruções de redefinição.');
    }
    async redefinirSenha(dto) {
        await this.authService.redefinirSenha(dto.token, dto.novaSenha);
        return (0, response_util_1.buildResponse)(null, 'Senha redefinida com sucesso. Faça login com sua nova senha.');
    }
    async googleAuth() { }
    async googleCallback(req, res) {
        try {
            const resultado = await this.authService.loginComGoogle({
                email: req.user.email,
                nome: req.user.nome,
            });
            const params = new URLSearchParams({
                accessToken: resultado.accessToken,
                refreshToken: resultado.refreshToken,
            });
            res.redirect(`${this.configService.frontendUrl}/oauth/callback?${params.toString()}`);
        }
        catch {
            res.redirect(`${this.configService.frontendUrl}/login?erro=google`);
        }
    }
    async login(dto) {
        const resultado = await this.authService.login(dto);
        return (0, response_util_1.buildResponse)(resultado, 'Login realizado com sucesso.');
    }
    async refresh(dto) {
        const resultado = await this.authService.refresh(dto.refreshToken);
        return (0, response_util_1.buildResponse)(resultado, 'Token renovado com sucesso.');
    }
    async me(currentUser) {
        const usuario = await this.usersService.findById(currentUser.id);
        return (0, response_util_1.buildResponse)(this.usersService.toProfileDto(usuario), 'Usuário obtido com sucesso.');
    }
    async logout(dto) {
        await this.authService.logout(dto.refreshToken);
        return (0, response_util_1.buildResponse)(null, 'Logout realizado com sucesso.');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra um novo usuário e envia e-mail de verificação' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário cadastrado. E-mail de verificação enviado.', type: register_response_dto_1.RegisterResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'E-mail já cadastrado.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verificar-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Confirma o e-mail a partir do token enviado e já autentica o usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'E-mail verificado com sucesso.', type: auth_response_dto_1.AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_email_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verificarEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reenviar-verificacao'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reenvia o e-mail de verificação de conta' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'E-mail de verificação reenviado, se aplicável.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_verification_dto_1.ResendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reenviarVerificacao", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('esqueci-senha'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Solicita a redefinição de senha por e-mail' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'E-mail de redefinição enviado, se aplicável.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "esqueciSenha", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('redefinir-senha'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Redefine a senha a partir do token recebido por e-mail' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Senha redefinida com sucesso.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "redefinirSenha", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Inicia o fluxo de login com Google' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Callback chamado pelo Google após o consentimento' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Autentica um usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso.', type: auth_response_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Renova o access token a partir de um refresh token válido' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token renovado com sucesso.', type: auth_response_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token inválido ou expirado.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna os dados do usuário autenticado a partir do access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuário retornado com sucesso.', type: user_profile_dto_1.UserProfileDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token inválido ou não informado.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Realiza logout revogando o refresh token informado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout realizado com sucesso.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        app_config_service_1.AppConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map