import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(companyId: string, dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: { ...dto, companyId },
    });
  }

    async listar(companyId: string, busca?: string) {
    return this.prisma.cliente.findMany({
      where: {
        companyId,
        ...(busca
          ? {
              OR: [
                { nome: { contains: busca, mode: 'insensitive' } },
                { empresa: { contains: busca, mode: 'insensitive' } },
                { cpfCnpj: { contains: busca, mode: 'insensitive' } },
                { email: { contains: busca, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const cliente = await this.prisma.cliente.findFirst({ where: { id, companyId } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return cliente;
  }

  async atualizar(companyId: string, id: string, dto: UpdateClienteDto) {
    await this.buscarPorId(companyId, id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async excluir(companyId: string, id: string) {
    await this.buscarPorId(companyId, id);
    await this.prisma.cliente.delete({ where: { id } });
    return { removido: true };
  }
}
