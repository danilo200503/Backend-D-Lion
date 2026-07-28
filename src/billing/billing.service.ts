import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCobrancaDto } from './dto/create-cobranca.dto';
import { UpdateCobrancaDto } from './dto/update-cobranca.dto';
import { EmailService } from '../email/email.service';
import { montarLinkWhatsapp, montarMensagemCobranca } from './utils/whatsapp-link.util';

interface FiltrosCobranca {
  status?: string;
  clienteId?: string;
}

interface FiltrosHistorico {
  clienteId?: string;
  tipoEnvio?: string;
  dataInicio?: string;
  dataFim?: string;
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async criar(companyId: string, dto: CreateCobrancaDto) {
    await this.garantirClienteDaEmpresa(companyId, dto.clienteId);

    return this.prisma.cobranca.create({
      data: {
        companyId,
        clienteId: dto.clienteId,
        descricao: dto.descricao,
        valor: dto.valor,
        vencimento: new Date(dto.vencimento),
        status: dto.status ?? 'PENDENTE',
      },
    });
  }

  async listar(companyId: string, filtros: FiltrosCobranca) {
    return this.prisma.cobranca.findMany({
      where: {
        companyId,
        ...(filtros.status ? { status: filtros.status as never } : {}),
        ...(filtros.clienteId ? { clienteId: filtros.clienteId } : {}),
      },
      include: { cliente: true },
      orderBy: { vencimento: 'asc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const cobranca = await this.prisma.cobranca.findFirst({
      where: { id, companyId },
      include: { cliente: true },
    });
    if (!cobranca) {
      throw new NotFoundException('Cobrança não encontrada.');
    }
    return cobranca;
  }

  async atualizar(companyId: string, id: string, dto: UpdateCobrancaDto) {
    await this.buscarPorId(companyId, id);

    if (dto.clienteId) {
      await this.garantirClienteDaEmpresa(companyId, dto.clienteId);
    }

    return this.prisma.cobranca.update({
      where: { id },
      data: {
        ...dto,
        vencimento: dto.vencimento ? new Date(dto.vencimento) : undefined,
      },
    });
  }

  async excluir(companyId: string, id: string) {
    await this.buscarPorId(companyId, id);
    await this.prisma.cobranca.delete({ where: { id } });
    return { removido: true };
  }

    async resumo(companyId: string) {
    const [total, pendentes, pagas, atrasadas] = await Promise.all([
      this.prisma.cobranca.count({ where: { companyId } }),
      this.prisma.cobranca.count({ where: { companyId, status: 'PENDENTE' } }),
      this.prisma.cobranca.count({ where: { companyId, status: 'PAGA' } }),
      this.prisma.cobranca.count({ where: { companyId, status: 'ATRASADA' } }),
    ]);

    return { total, pendentes, pagas, atrasadas };
  }

    async enviarPorEmail(companyId: string, cobrancaId: string) {
    const cobranca = await this.buscarPorId(companyId, cobrancaId);

    if (!cobranca.cliente.email) {
      throw new BadRequestException('Este cliente não possui e-mail cadastrado.');
    }

    await this.emailService.enviarCobranca({
      destinatarioEmail: cobranca.cliente.email,
      destinatarioNome: cobranca.cliente.nome,
      empresa: cobranca.cliente.empresa ?? cobranca.cliente.nome,
      descricao: cobranca.descricao,
      valor: cobranca.valor,
      vencimento: cobranca.vencimento,
    });

    await this.prisma.billingHistory.create({
      data: { cobrancaId, tipoEnvio: 'EMAIL' },
    });

    return this.prisma.cobranca.update({
      where: { id: cobrancaId },
      data: { status: 'ENVIADA', dataEnvio: new Date() },
    });
  }

    async gerarLinkWhatsapp(companyId: string, cobrancaId: string) {
    const cobranca = await this.buscarPorId(companyId, cobrancaId);

    if (!cobranca.cliente.telefone) {
      throw new BadRequestException('Este cliente não possui telefone cadastrado.');
    }

    const mensagem = montarMensagemCobranca({
      descricao: cobranca.descricao,
      valor: cobranca.valor,
      vencimento: cobranca.vencimento,
    });
    const link = montarLinkWhatsapp(cobranca.cliente.telefone, mensagem);

    await this.prisma.billingHistory.create({
      data: { cobrancaId, tipoEnvio: 'WHATSAPP' },
    });

    await this.prisma.cobranca.update({
      where: { id: cobrancaId },
      data: { status: 'ENVIADA', dataEnvio: new Date() },
    });

    return { link, mensagem };
  }

    async listarHistorico(companyId: string, filtros: FiltrosHistorico) {
    return this.prisma.billingHistory.findMany({
      where: {
        cobranca: {
          companyId,
          ...(filtros.clienteId ? { clienteId: filtros.clienteId } : {}),
        },
        ...(filtros.tipoEnvio ? { tipoEnvio: filtros.tipoEnvio as never } : {}),
        ...(filtros.dataInicio || filtros.dataFim
          ? {
              dataEnvio: {
                ...(filtros.dataInicio ? { gte: new Date(filtros.dataInicio) } : {}),
                ...(filtros.dataFim ? { lte: new Date(filtros.dataFim) } : {}),
              },
            }
          : {}),
      },
      include: { cobranca: { include: { cliente: true } } },
      orderBy: { dataEnvio: 'desc' },
    });
  }

  private async garantirClienteDaEmpresa(companyId: string, clienteId: string): Promise<void> {
    const cliente = await this.prisma.cliente.findFirst({ where: { id: clienteId, companyId } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
  }
}
