import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '../config/app-config.service';

interface DadosEmailCobranca {
  destinatarioEmail: string;
  destinatarioNome: string;
  empresa: string;
  descricao: string;
  valor?: number | null;
  vencimento: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: AppConfigService) {
    if (this.configService.smtpConfigured) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.smtpHost,
        port: this.configService.smtpPort,
        secure: this.configService.smtpSecure,
        auth: {
          user: this.configService.smtpUser,
          pass: this.configService.smtpPass,
        },
      });
    }
  }

  async enviarCobranca(dados: DadosEmailCobranca): Promise<void> {
    const assunto = `Cobrança — ${dados.descricao}`;
    const html = this.montarTemplateCobranca(dados);
    await this.enviar(dados.destinatarioEmail, assunto, html, 'cobrança');
  }

  async enviarVerificacaoEmail(destinatarioEmail: string, destinatarioNome: string, token: string): Promise<void> {
    const link = `${this.configService.frontendUrl}/verificar-email?token=${token}`;
    const assunto = 'Confirme seu e-mail — D-LION';
    const html = this.montarTemplateBase({
      titulo: `Olá, ${destinatarioNome}`,
      corpo: `
        <p style="margin:0 0 20px;font-size:14px;color:#4B5160;">
          Falta só um passo para começar a usar o D-LION: confirme seu e-mail clicando no botão abaixo.
        </p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${link}" style="background-color:#B8912C;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">Confirmar e-mail</a>
        </p>
        <p style="margin:0;font-size:12px;color:#8A8F98;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <span style="color:#4B5160;">${link}</span>
        </p>
        <p style="margin:20px 0 0;font-size:12px;color:#8A8F98;">Este link expira em 24 horas.</p>
      `,
    });
    await this.enviar(destinatarioEmail, assunto, html, 'verificação de e-mail');
  }

  async enviarRedefinicaoSenha(destinatarioEmail: string, destinatarioNome: string, token: string): Promise<void> {
    const link = `${this.configService.frontendUrl}/redefinir-senha?token=${token}`;
    const assunto = 'Redefinição de senha — D-LION';
    const html = this.montarTemplateBase({
      titulo: `Olá, ${destinatarioNome}`,
      corpo: `
        <p style="margin:0 0 20px;font-size:14px;color:#4B5160;">
          Recebemos um pedido para redefinir a sua senha no D-LION. Clique no botão abaixo para criar uma nova senha.
        </p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${link}" style="background-color:#B8912C;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:bold;display:inline-block;">Redefinir senha</a>
        </p>
        <p style="margin:0;font-size:12px;color:#8A8F98;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <span style="color:#4B5160;">${link}</span>
        </p>
        <p style="margin:20px 0 0;font-size:12px;color:#8A8F98;">
          Este link expira em 1 hora. Se você não pediu essa redefinição, ignore este e-mail.
        </p>
      `,
    });
    await this.enviar(destinatarioEmail, assunto, html, 'redefinição de senha');
  }

  private async enviar(destinatario: string, assunto: string, html: string, tipo: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP não configurado — simulando envio de e-mail de ${tipo} para ${destinatario} (assunto: "${assunto}").`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.smtpFrom,
      to: destinatario,
      subject: assunto,
      html,
    });
  }

  private montarTemplateBase(params: { titulo: string; corpo: string }): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <body style="margin:0;padding:0;background-color:#F5F6F8;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F6F8;padding:24px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background-color:#B8912C;padding:20px 28px;">
                      <span style="color:#FFFFFF;font-size:20px;font-weight:bold;letter-spacing:0.5px;">D-LION</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;color:#333333;">${params.titulo}</p>
                      ${params.corpo}
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#F5F6F8;padding:16px 28px;text-align:center;">
                      <span style="font-size:11px;color:#8A8F98;">D-LION — Sistema Contábil Inteligente</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private montarTemplateCobranca(dados: DadosEmailCobranca): string {
    const valorFormatado =
      dados.valor != null
        ? dados.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'A combinar';
    const vencimentoFormatado = dados.vencimento.toLocaleDateString('pt-BR');

    return this.montarTemplateBase({
      titulo: `Olá, ${dados.destinatarioNome}`,
      corpo: `
        <p style="margin:0 0 20px;font-size:14px;color:#4B5160;">Segue o detalhamento da sua cobrança:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:13px;color:#8A8F98;">Empresa</td>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:13px;color:#333333;text-align:right;font-weight:bold;">${dados.empresa}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:13px;color:#8A8F98;">Descrição</td>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:13px;color:#333333;text-align:right;font-weight:bold;">${dados.descricao}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:13px;color:#8A8F98;">Valor</td>
            <td style="padding:10px 0;border-bottom:1px solid #E7E8EC;font-size:16px;color:#B8912C;text-align:right;font-weight:bold;">${valorFormatado}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;font-size:13px;color:#8A8F98;">Vencimento</td>
            <td style="padding:10px 0;font-size:13px;color:#333333;text-align:right;font-weight:bold;">${vencimentoFormatado}</td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#8A8F98;">
          Este é um e-mail automático enviado pelo sistema D-LION. Em caso de dúvidas, entre em contato diretamente com a empresa emissora.
        </p>
      `,
    });
  }
}
