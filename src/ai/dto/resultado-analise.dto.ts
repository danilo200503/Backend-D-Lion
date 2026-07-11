import { ApiProperty } from '@nestjs/swagger';

export class ErroFiscalDto {
  @ApiProperty()
  tipo: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  explicacao: string;

  @ApiProperty()
  correcao: string;

  @ApiProperty({ enum: ['ALTA', 'MEDIA', 'BAIXA'] })
  severidade: string;

  @ApiProperty()
  pontosPerdidos: number;
}

export class ResultadoAnaliseFiscalDto {
  @ApiProperty()
  documentoId: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  score: number;

  @ApiProperty({ enum: ['Excelente', 'Boa', 'Regular', 'Ruim'] })
  classificacao: string;

  @ApiProperty()
  totalErros: number;

  @ApiProperty({ type: [ErroFiscalDto] })
  erros: ErroFiscalDto[];
}
