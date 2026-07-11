import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

const STATUS_VALIDOS = ['PENDENTE', 'ENVIADA', 'PAGA', 'ATRASADA'] as const;

export class CreateCobrancaDto {
  @ApiProperty({ example: 'a2c13519-b749-41b4-bc3c-ab64f6a9593d' })
  @IsUUID()
  clienteId: string;

  @ApiProperty({ example: 'Honorários contábeis - Julho/2026' })
  @IsString()
  @IsNotEmpty({ message: 'A descrição da cobrança é obrigatória.' })
  descricao: string;

  @ApiProperty({ example: 450.0, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'O valor da cobrança deve ser maior que zero.' })
  valor?: number;

  @ApiProperty({ example: '2026-08-10' })
  @IsISO8601({ strict: false }, { message: 'Informe uma data de vencimento válida (AAAA-MM-DD).' })
  vencimento: string;

  @ApiProperty({ enum: STATUS_VALIDOS, required: false, default: 'PENDENTE' })
  @IsOptional()
  @IsIn(STATUS_VALIDOS, { message: 'Status inválido.' })
  status?: (typeof STATUS_VALIDOS)[number];
}
