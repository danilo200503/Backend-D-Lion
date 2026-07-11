import { ConflictException, Inject, Injectable, LoggerService, NotFoundException } from '@nestjs/common';
import { Company } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

    async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
  }

    async findById(id: string): Promise<Company> {
    const empresa = await this.prisma.company.findUnique({ where: { id } });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return empresa;
  }

    async create(dto: CreateCompanyDto): Promise<Company> {
    const empresaExistente = await this.prisma.company.findUnique({
      where: { cnpj: dto.cnpj },
    });

    if (empresaExistente) {
      throw new ConflictException('Já existe uma empresa cadastrada com este CNPJ.');
    }

    const empresa = await this.prisma.company.create({ data: dto });
    this.logger.log(`Empresa cadastrada: ${empresa.name} (${empresa.cnpj})`, 'CompanyService');

    return empresa;
  }

    async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.findById(id);

    if (dto.cnpj) {
      const empresaComMesmoCnpj = await this.prisma.company.findUnique({
        where: { cnpj: dto.cnpj },
      });

      if (empresaComMesmoCnpj && empresaComMesmoCnpj.id !== id) {
        throw new ConflictException('Já existe uma empresa cadastrada com este CNPJ.');
      }
    }

    const empresa = await this.prisma.company.update({ where: { id }, data: dto });
    this.logger.log(`Empresa atualizada: ${empresa.id}`, 'CompanyService');

    return empresa;
  }

    async remove(id: string): Promise<void> {
    await this.findById(id);

    const totalUsuariosVinculados = await this.prisma.user.count({ where: { companyId: id } });
    if (totalUsuariosVinculados > 0) {
      throw new ConflictException(
        'Não é possível remover a empresa: existem usuários vinculados a ela.',
      );
    }

    await this.prisma.company.delete({ where: { id } });
    this.logger.log(`Empresa removida: ${id}`, 'CompanyService');
  }

    toResponseDto(empresa: Company, totalUsuarios?: number): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = empresa.id;
    dto.name = empresa.name;
    dto.cnpj = empresa.cnpj;
    dto.totalUsuarios = totalUsuarios;
    dto.createdAt = empresa.createdAt;
    dto.updatedAt = empresa.updatedAt;
    return dto;
  }
}
