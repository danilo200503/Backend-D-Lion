import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GerarPlanoTributarioDto {
  @ApiProperty({ description: 'ID do cliente para o qual o plano tributário será traçado' })
  @IsUUID()
  clienteId: string;
}
