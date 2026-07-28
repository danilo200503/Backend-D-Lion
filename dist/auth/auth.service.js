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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const nest_winston_1 = require("nest-winston");
const uuid_1 = require("uuid");
const app_config_service_1 = require("../config/app-config.service");
const prisma_service_1 = require("../database/prisma.service");
const email_service_1 = require("../email/email.service");
const users_service_1 = require("../users/users.service");
const REFRESH_TOKEN_EXPIRATION_MAP = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
};
let AuthService = class AuthService {
    constructor(usersService, prisma, jwtService, configService, emailService, logger) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.logger = logger;
    }
    async register(dto) {
        const usuario = await this.usersService.create(dto);
        this.logger.log(`Novo usuário cadastrado: ${usuario.email}`, 'AuthService');
        if (usuario.tokenVerificacaoEmail) {
            await this.emailService.enviarVerificacaoEmail(usuario.email, usuario.nome, usuario.tokenVerificacaoEmail);
        }
        return { email: usuario.email, emailVerificado: usuario.emailVerificado };
    }
    async verificarEmail(token) {
        const usuario = await this.usersService.verificarEmail(token);
        this.logger.log(`E-mail verificado: ${usuario.email}`, 'AuthService');
        return this.gerarRespostaAutenticacao(usuario);
    }
    async reenviarVerificacao(email) {
        const usuario = await this.usersService.gerarNovoTokenVerificacao(email);
        if (usuario.tokenVerificacaoEmail) {
            await this.emailService.enviarVerificacaoEmail(usuario.email, usuario.nome, usuario.tokenVerificacaoEmail);
        }
    }
    async esqueciSenha(email) {
        const usuario = await this.usersService.gerarTokenResetSenha(email);
        if (usuario && usuario.tokenResetSenha) {
            await this.emailService.enviarRedefinicaoSenha(usuario.email, usuario.nome, usuario.tokenResetSenha);
        }
    }
    async redefinirSenha(token, novaSenha) {
        await this.usersService.redefinirSenhaComToken(token, novaSenha);
    }
    async loginComGoogle(dados) {
        const usuario = await this.usersService.encontrarOuCriarComGoogle(dados);
        await this.usersService.atualizarUltimoLogin(usuario.id);
        this.logger.log(`Login com Google: ${usuario.email}`, 'AuthService');
        return this.gerarRespostaAutenticacao(usuario);
    }
    async login(dto) {
        const usuario = await this.usersService.findByEmail(dto.email);
        if (!usuario || !usuario.ativo) {
            throw new common_1.UnauthorizedException('E-mail ou senha inválidos.');
        }
        const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('E-mail ou senha inválidos.');
        }
        if (!usuario.emailVerificado) {
            throw new common_1.UnauthorizedException('Seu e-mail ainda não foi verificado. Confira sua caixa de entrada ou solicite um novo link de verificação.');
        }
        await this.usersService.atualizarUltimoLogin(usuario.id);
        this.logger.log(`Login realizado: ${usuario.email}`, 'AuthService');
        return this.gerarRespostaAutenticacao(usuario);
    }
    async refresh(refreshToken) {
        const tokenArmazenado = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!tokenArmazenado || tokenArmazenado.revoked || tokenArmazenado.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token inválido ou expirado.');
        }
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.jwtRefreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token inválido ou expirado.');
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenArmazenado.id },
            data: { revoked: true },
        });
        const usuario = await this.usersService.findById(tokenArmazenado.userId);
        this.logger.log(`Refresh token renovado: ${usuario.email}`, 'AuthService');
        return this.gerarRespostaAutenticacao(usuario);
    }
    async logout(refreshToken) {
        const tokenArmazenado = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!tokenArmazenado) {
            return;
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenArmazenado.id },
            data: { revoked: true },
        });
        this.logger.log(`Logout realizado para userId: ${tokenArmazenado.userId}`, 'AuthService');
    }
    async gerarRespostaAutenticacao(usuario) {
        const roles = usuario.userRoles.map((userRole) => userRole.role.nome);
        const tokens = await this.gerarTokens(usuario.id, usuario.email, roles);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                company: {
                    id: usuario.company.id,
                    name: usuario.company.name,
                    cnpj: usuario.company.cnpj,
                },
                permissoes: roles,
            },
        };
    }
    async gerarTokens(userId, email, roles) {
        const payload = { sub: userId, email, roles };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.jwtSecret,
            expiresIn: this.configService.jwtExpiresIn,
        });
        const refreshTokenValue = this.jwtService.sign({ sub: userId }, {
            secret: this.configService.jwtRefreshSecret,
            expiresIn: this.configService.jwtRefreshExpiresIn,
        });
        const expiresAt = new Date(Date.now() + this.parseExpirationToMs(this.configService.jwtRefreshExpiresIn));
        await this.prisma.refreshToken.create({
            data: {
                id: (0, uuid_1.v4)(),
                token: refreshTokenValue,
                userId,
                expiresAt,
            },
        });
        return { accessToken, refreshToken: refreshTokenValue };
    }
    parseExpirationToMs(expiresIn) {
        const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
        if (!match) {
            return REFRESH_TOKEN_EXPIRATION_MAP.d * 7;
        }
        const [, quantidade, unidade] = match;
        return Number(quantidade) * REFRESH_TOKEN_EXPIRATION_MAP[unidade];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        app_config_service_1.AppConfigService,
        email_service_1.EmailService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map