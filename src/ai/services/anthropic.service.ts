import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class AnthropicService {
  private readonly client: Anthropic | null;

  constructor(private readonly configService: AppConfigService) {
    this.client = this.configService.anthropicConfigured
      ? new Anthropic({ apiKey: this.configService.anthropicApiKey })
      : null;
  }

  async gerarTexto(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'A explicação por IA não está configurada neste ambiente. Configure a variável ANTHROPIC_API_KEY.',
      );
    }

    const resposta = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const blocoTexto = resposta.content.find((bloco) => bloco.type === 'text');
    return blocoTexto && blocoTexto.type === 'text' ? blocoTexto.text : '';
  }
}
