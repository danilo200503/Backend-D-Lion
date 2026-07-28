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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const nest_winston_1 = require("nest-winston");
const prisma_service_1 = require("../database/prisma.service");
const user_profile_dto_1 = require("./dto/user-profile.dto");
const BCRYPT_SALT_ROUNDS = 12;
const ROLE_PADRAO_CADASTRO = 'Cliente';
let UsersService = class UsersService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async create(registerDto) {
        const usuarioExistente = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (usuarioExistente) {
            throw new common_1.ConflictException('Já existe um usuário cadastrado com este e-mail.');
        }
        let empresaId = registerDto.companyId;
        let nomeRole = ROLE_PADRAO_CADASTRO;
        if (empresaId) {
            const empresa = await this.prisma.company.findUnique({ where: { id: empresaId } });
            if (!empresa) {
                throw new common_1.NotFoundException('Empresa (companyId) informada não foi encontrada.');
            }
        }
        else {
            const novaEmpresa = await this.prisma.company.create({
                data: {
                    name: registerDto.nomeEmpresa || `${registerDto.nome} - Empresa`,
                    cnpj: this.gerarCnpjPlaceholder(),
                },
            });
            empresaId = novaEmpresa.id;
            nomeRole = 'Administrador';
        }
        const senhaHash = await bcrypt.hash(registerDto.senha, BCRYPT_SALT_ROUNDS);
        const tokenVerificacaoEmail = (0, crypto_1.randomUUID)();
        const tokenVerificacaoExpiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const role = await this.prisma.role.findUnique({
            where: { nome: nomeRole },
        });
        if (!role) {
            throw new common_1.BadRequestException('Role padrão de cadastro não encontrada. Execute o seed do banco de dados.');
        }
        const usuario = await this.prisma.user.create({
            data: {
                nome: registerDto.nome,
                email: registerDto.email,
                senhaHash,
                companyId: empresaId,
                cargo: registerDto.cargo,
                telefone: registerDto.telefone,
                emailVerificado: false,
                tokenVerificacaoEmail,
                tokenVerificacaoExpiraEm,
                userRoles: {
                    create: { roleId: role.id },
                },
            },
            include: { userRoles: { include: { role: true } }, company: true },
        });
        return usuario;
    }
    gerarCnpjPlaceholder() {
        const numeros = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
        return `${numeros}-${Date.now()}`;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } }, company: true },
        });
    }
    async findById(id) {
        const usuario = await this.prisma.user.findUnique({
            where: { id },
            include: { userRoles: { include: { role: true } }, company: true },
        });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        return usuario;
    }
    async updateProfile(userId, dto) {
        await this.findById(userId);
        return this.prisma.user.update({
            where: { id: userId },
            data: { ...dto },
            include: { userRoles: { include: { role: true } }, company: true },
        });
    }
    async changePassword(userId, dto) {
        const usuario = await this.findById(userId);
        const senhaValida = await bcrypt.compare(dto.senhaAtual, usuario.senhaHash);
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('Senha atual incorreta.');
        }
        const novaSenhaHash = await bcrypt.hash(dto.novaSenha, BCRYPT_SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { senhaHash: novaSenhaHash },
        });
    }
    async updateAvatar(userId, avatarPath) {
        const usuario = await this.findById(userId);
        const usuarioAtualizado = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarPath },
            include: { userRoles: { include: { role: true } }, company: true },
        });
        this.logger.log(`Avatar atualizado para o usuário: ${usuario.email}`, 'UsersService');
        return usuarioAtualizado;
    }
    async atualizarUltimoLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { ultimoLogin: new Date() },
        });
    }
    toProfileDto(usuario) {
        const dto = new user_profile_dto_1.UserProfileDto();
        dto.id = usuario.id;
        dto.nome = usuario.nome;
        dto.email = usuario.email;
        dto.company = {
            id: usuario.company.id,
            name: usuario.company.name,
            cnpj: usuario.company.cnpj,
        };
        dto.cargo = usuario.cargo ?? undefined;
        dto.telefone = usuario.telefone ?? undefined;
        dto.avatar = usuario.avatar ?? undefined;
        dto.ativo = usuario.ativo;
        dto.ultimoLogin = usuario.ultimoLogin ?? undefined;
        dto.permissoes = usuario.userRoles.map((userRole) => userRole.role.nome);
        dto.createdAt = usuario.createdAt;
        return dto;
    }
    async verificarEmail(token) {
        const usuario = await this.prisma.user.findUnique({
            where: { tokenVerificacaoEmail: token },
            include: { userRoles: { include: { role: true } }, company: true },
        });
        if (!usuario) {
            throw new common_1.BadRequestException('Token de verificação inválido.');
        }
        if (usuario.tokenVerificacaoExpiraEm && usuario.tokenVerificacaoExpiraEm < new Date()) {
            throw new common_1.BadRequestException('Token de verificação expirado. Solicite um novo e-mail de confirmação.');
        }
        return this.prisma.user.update({
            where: { id: usuario.id },
            data: {
                emailVerificado: true,
                tokenVerificacaoEmail: null,
                tokenVerificacaoExpiraEm: null,
            },
            include: { userRoles: { include: { role: true } }, company: true },
        });
    }
    async gerarNovoTokenVerificacao(email) {
        const usuario = await this.findByEmail(email);
        if (!usuario) {
            throw new common_1.NotFoundException('Nenhum usuário encontrado com este e-mail.');
        }
        if (usuario.emailVerificado) {
            throw new common_1.BadRequestException('Este e-mail já está verificado.');
        }
        const tokenVerificacaoEmail = (0, crypto_1.randomUUID)();
        const tokenVerificacaoExpiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return this.prisma.user.update({
            where: { id: usuario.id },
            data: { tokenVerificacaoEmail, tokenVerificacaoExpiraEm },
            include: { userRoles: { include: { role: true } }, company: true },
        });
    }
    async gerarTokenResetSenha(email) {
        const usuario = await this.findByEmail(email);
        if (!usuario) {
            return null;
        }
        const tokenResetSenha = (0, crypto_1.randomUUID)();
        const tokenResetSenhaExpiraEm = new Date(Date.now() + 60 * 60 * 1000);
        return this.prisma.user.update({
            where: { id: usuario.id },
            data: { tokenResetSenha, tokenResetSenhaExpiraEm },
            include: { userRoles: { include: { role: true } }, company: true },
        });
    }
    async redefinirSenhaComToken(token, novaSenha) {
        const usuario = await this.prisma.user.findUnique({
            where: { tokenResetSenha: token },
        });
        if (!usuario) {
            throw new common_1.BadRequestException('Token de redefinição inválido.');
        }
        if (usuario.tokenResetSenhaExpiraEm && usuario.tokenResetSenhaExpiraEm < new Date()) {
            throw new common_1.BadRequestException('Token de redefinição expirado. Solicite uma nova recuperação de senha.');
        }
        const senhaHash = await bcrypt.hash(novaSenha, BCRYPT_SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: usuario.id },
            data: {
                senhaHash,
                tokenResetSenha: null,
                tokenResetSenhaExpiraEm: null,
            },
        });
    }
    async encontrarOuCriarComGoogle(dados) {
        const usuarioExistente = await this.findByEmail(dados.email);
        if (usuarioExistente) {
            if (!usuarioExistente.emailVerificado) {
                await this.prisma.user.update({
                    where: { id: usuarioExistente.id },
                    data: { emailVerificado: true },
                });
                return this.findById(usuarioExistente.id);
            }
            return usuarioExistente;
        }
        const senhaAleatoriaHash = await bcrypt.hash((0, crypto_1.randomUUID)(), BCRYPT_SALT_ROUNDS);
        const novaEmpresa = await this.prisma.company.create({
            data: {
                name: `${dados.nome} - Empresa`,
                cnpj: this.gerarCnpjPlaceholder(),
            },
        });
        const roleAdministrador = await this.prisma.role.findUnique({
            where: { nome: 'Administrador' },
        });
        if (!roleAdministrador) {
            throw new common_1.BadRequestException('Role padrão de cadastro não encontrada. Execute o seed do banco de dados.');
        }
        const usuario = await this.prisma.user.create({
            data: {
                nome: dados.nome,
                email: dados.email,
                senhaHash: senhaAleatoriaHash,
                companyId: novaEmpresa.id,
                emailVerificado: true,
                userRoles: {
                    create: { roleId: roleAdministrador.id },
                },
            },
            include: { userRoles: { include: { role: true } }, company: true },
        });
        return usuario;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map