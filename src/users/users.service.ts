import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserWithRoles } from './interfaces/user-with-roles.interface';

const BCRYPT_SALT_ROUNDS = 12;
const ROLE_PADRAO_CADASTRO = 'Cliente';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  
  async create(registerDto: RegisterDto): Promise<UserWithRoles> {
    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }

    let empresaId = registerDto.companyId;
    let nomeRole = ROLE_PADRAO_CADASTRO;

    if (empresaId) {
      const empresa = await this.prisma.company.findUnique({ where: { id: empresaId } });
      if (!empresa) {
        throw new NotFoundException('Empresa (companyId) informada não foi encontrada.');
      }
    } else {
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

    const role = await this.prisma.role.findUnique({
      where: { nome: nomeRole },
    });

    if (!role) {
      throw new BadRequestException(
        'Role padrão de cadastro não encontrada. Execute o seed do banco de dados.',
      );
    }

    const usuario = await this.prisma.user.create({
      data: {
        nome: registerDto.nome,
        email: registerDto.email,
        senhaHash,
        companyId: empresaId,
        cargo: registerDto.cargo,
        telefone: registerDto.telefone,
        userRoles: {
          create: { roleId: role.id },
        },
      },
      include: { userRoles: { include: { role: true } }, company: true },
    });

    return usuario;
  }

  private gerarCnpjPlaceholder(): string {
    const numeros = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    return `${numeros}-${Date.now()}`;
  }

  /**
   * Busca um usuário pelo e-mail, incluindo suas roles.
   * Utilizado principalmente pelo fluxo de autenticação.
   */
  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } }, company: true },
    });
  }

  /**
   * Busca um usuário pelo id, incluindo suas roles.
   * Lança NotFoundException caso não exista.
   */
  async findById(id: string): Promise<UserWithRoles> {
    const usuario = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } }, company: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  /**
   * Atualiza os dados de perfil do usuário autenticado.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserWithRoles> {
    await this.findById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
      include: { userRoles: { include: { role: true } }, company: true },
    });
  }

  /**
   * Realiza a troca de senha do usuário autenticado, validando
   * previamente a senha atual informada.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const usuario = await this.findById(userId);

    const senhaValida = await bcrypt.compare(dto.senhaAtual, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    const novaSenhaHash = await bcrypt.hash(dto.novaSenha, BCRYPT_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { senhaHash: novaSenhaHash },
    });
  }

  /**
   * Atualiza o avatar do usuário autenticado a partir do caminho
   * público do arquivo já salvo pelo UsersController (upload via multer).
   */
  async updateAvatar(userId: string, avatarPath: string): Promise<UserWithRoles> {
    const usuario = await this.findById(userId);

    const usuarioAtualizado = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      include: { userRoles: { include: { role: true } }, company: true },
    });

    this.logger.log(`Avatar atualizado para o usuário: ${usuario.email}`, 'UsersService');

    return usuarioAtualizado;
  }

  
  async atualizarUltimoLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { ultimoLogin: new Date() },
    });
  }

  
  toProfileDto(usuario: UserWithRoles): UserProfileDto {
    const dto = new UserProfileDto();
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
}
