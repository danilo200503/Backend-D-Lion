import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export const TIPOS_LANCAMENTO = ['NOTA', 'CUPOM', 'DANFE', 'OUTRO'] as const;
export const NATUREZAS_OPERACAO = ['ENTRADA', 'SAIDA'] as const;

export class CreateLancamentoDto {
  @ApiProperty({ enum: TIPOS_LANCAMENTO, example: 'NOTA' })
  @IsIn(TIPOS_LANCAMENTO)
  tipo: string;

  @ApiProperty({ enum: NATUREZAS_OPERACAO, example: 'SAIDA' })
  @IsIn(NATUREZAS_OPERACAO)
  naturezaOperacao: string;

  @ApiProperty({ example: '2026-07-28' })
  @IsISO8601()
  dataCompetencia: string;

  @ApiProperty({ example: 'Venda de mercadorias para Cliente XPTO' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  descricao: string;

  @ApiProperty({ example: 1250.5 })
  @IsNumber()
  @IsPositive({ message: 'O valor deve ser maior que zero.' })
  valor: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({
    required: false,
    description: 'ID de um documento fiscal já enviado, caso este lançamento esteja vinculado a ele.',
  })
  @IsOptional()
  @IsUUID()
  documentoFiscalId?: string;
}
