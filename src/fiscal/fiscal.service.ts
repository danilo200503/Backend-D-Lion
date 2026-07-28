import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { PrismaService } from '../database/prisma.service';
import { extrairDadosNfe } from './utils/nfe-xml-parser';

@Injectable()
export class FiscalService {
  private readonly logger = new Logger(FiscalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processarUpload(companyId: string, uploadedById: string, file: Express.Multer.File) {
    try {
      const conteudo = await readFile(file.path, 'utf-8');
      const listaDeDados = extrairDadosNfe(conteudo);

      const documentos = [];
      for (const [indice, dados] of listaDeDados.entries()) {
        const nomeArquivo =
          listaDeDados.length > 1 ? `${file.originalname} (nota ${indice + 1} de ${listaDeDados.length})` : file.originalname;

        const documento = await this.prisma.fiscalDocument.create({
          data: {
            companyId,
            uploadedById,
            nomeArquivo,
            caminhoArquivo: file.path,
            status: 'CONCLUIDO',
            tipoDocumento: dados.tipoDocumento,
            empresa: dados.empresa,
            cnpj: dados.cnpj,
            numeroNota: dados.numeroNota,
            serie: dados.serie,
            chaveAcesso: dados.chaveAcesso,
            dataEmissao: dados.dataEmissao ? new Date(dados.dataEmissao) : undefined,
            destinatario: dados.destinatario,
            destinatarioCnpj: dados.destinatarioCnpj,
            destinatarioUf: dados.destinatarioUf,
            municipio: dados.municipio,
            uf: dados.uf,
            indicadorIE: dados.indicadorIE,
            valorTotal: dados.valorTotal,
            impostos: dados.impostos as unknown as object,
            itens: dados.itens as unknown as object,
            alertas: dados.alertas as unknown as object,
            erros: [],
            recomendacoes: [],
          },
        });

        documentos.push(documento);
      }

      return documentos;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Falha desconhecida ao processar o XML.';
      this.logger.warn(`Falha ao processar XML fiscal ${file.originalname}: ${mensagem}`);

      const documento = await this.prisma.fiscalDocument.create({
        data: {
          companyId,
          uploadedById,
          nomeArquivo: file.originalname,
          caminhoArquivo: file.path,
          status: 'ERRO',
          mensagemErro: mensagem,
          erros: [mensagem] as unknown as object,
        },
      });

      return [documento];
    }
  }

  async listarPorEmpresa(companyId: string) {
    return this.prisma.fiscalDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async buscarPorId(companyId: string, id: string) {
    const documento = await this.prisma.fiscalDocument.findFirst({
      where: { id, companyId },
    });

    if (!documento) {
      throw new NotFoundException('Documento fiscal não encontrado.');
    }

    return documento;
  }

    async salvarResultadoAnalise(
    companyId: string,
    documentoId: string,
    resultado: { score: number; classificacao: string; erros: unknown[]; totalErros: number }
  ) {
    await this.buscarPorId(companyId, documentoId); 

    await this.prisma.fiscalDocument.update({
      where: { id: documentoId },
      data: {
        scoreFiscal: resultado.score,
        classificacao: resultado.classificacao,
        erros: resultado.erros as unknown as object,
      },
    });

    return this.prisma.fiscalAnalysis.create({
      data: {
        documentId: documentoId,
        companyId,
        scoreFiscal: resultado.score,
        classificacao: resultado.classificacao,
        erros: resultado.erros as unknown as object,
        totalErros: resultado.totalErros,
      },
    });
  }

    async listarHistoricoAnalises(companyId: string) {
    return this.prisma.fiscalAnalysis.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { document: true },
    });
  }
}
