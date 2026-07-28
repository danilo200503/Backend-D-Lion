import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export const REGIMES_TRIBUTARIOS = ['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'] as const;

export class CreateApuracaoDto {
  @ApiProperty({ example: '2026-07', description: 'Competência no formato AAAA-MM' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Informe a competência no formato AAAA-MM.' })
  competencia: string;

  @ApiProperty({ enum: REGIMES_TRIBUTARIOS })
  @IsIn(REGIMES_TRIBUTARIOS)
  regimeTributario: string;

  @ApiProperty({ required: false, enum: ['I', 'III'], description: 'Obrigatório apenas para Simples Nacional' })
  @IsOptional()
  @IsIn(['I', 'III'])
  anexoSimples?: 'I' | 'III';

  @ApiProperty({ example: 45000, description: 'Receita bruta do mês da competência' })
  @IsNumber()
  @IsPositive()
  receitaBrutaPeriodo: number;

  @ApiProperty({
    required: false,
    example: 480000,
    description: 'Receita bruta acumulada dos últimos 12 meses (RBT12), obrigatória para Simples Nacional',
  })
  @IsOptional()
  @IsNumber()
  receitaBrutaUltimos12Meses?: number;

  @ApiProperty({ required: false, description: 'Soma dos débitos do período (obrigatório para Lucro Presumido/Real)' })
  @IsOptional()
  @IsNumber()
  totalDebitos?: number;

  @ApiProperty({ required: false, description: 'Soma dos créditos do período (obrigatório para Lucro Presumido/Real)' })
  @IsOptional()
  @IsNumber()
  totalCreditos?: number;
}
