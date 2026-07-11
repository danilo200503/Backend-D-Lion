import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ImpostoDto {
  @Expose()
  @ApiProperty()
  tipo: string;

  @Expose()
  @ApiProperty()
  valor: number;
}

@Exclude()
export class FiscalDocumentResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  nomeArquivo: string;

  @Expose()
  @ApiProperty({ enum: ['PROCESSANDO', 'CONCLUIDO', 'ERRO'] })
  status: string;

  @Expose()
  @ApiProperty({ required: false })
  empresa?: string;

  @Expose()
  @ApiProperty({ required: false })
  cnpj?: string;

  @Expose()
  @ApiProperty({ required: false })
  numeroNota?: string;

  @Expose()
  @ApiProperty({ required: false })
  valorTotal?: number;

  @Expose()
  @ApiProperty({ type: [ImpostoDto], required: false })
  impostos?: ImpostoDto[];

  @Expose()
  @ApiProperty({ type: [String], required: false })
  erros?: string[];

  @Expose()
  @ApiProperty({ type: [String], required: false })
  alertas?: string[];

  @Expose()
  @ApiProperty({ type: [String], required: false })
  recomendacoes?: string[];

  @Expose()
  @ApiProperty({ required: false })
  mensagemErro?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
