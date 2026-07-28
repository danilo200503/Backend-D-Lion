import { LoggerService } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserWithRoles } from './interfaces/user-with-roles.interface';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService, logger: LoggerService);
    create(registerDto: RegisterDto): Promise<UserWithRoles>;
    private gerarCnpjPlaceholder;
    findByEmail(email: string): Promise<UserWithRoles | null>;
    findById(id: string): Promise<UserWithRoles>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserWithRoles>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    updateAvatar(userId: string, avatarPath: string): Promise<UserWithRoles>;
    atualizarUltimoLogin(userId: string): Promise<void>;
    toProfileDto(usuario: UserWithRoles): UserProfileDto;
    verificarEmail(token: string): Promise<UserWithRoles>;
    gerarNovoTokenVerificacao(email: string): Promise<UserWithRoles>;
    gerarTokenResetSenha(email: string): Promise<UserWithRoles | null>;
    redefinirSenhaComToken(token: string, novaSenha: string): Promise<void>;
    encontrarOuCriarComGoogle(dados: {
        email: string;
        nome: string;
    }): Promise<UserWithRoles>;
}
