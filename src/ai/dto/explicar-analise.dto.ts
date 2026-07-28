import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ExplicarAnaliseDto {
  @ApiProperty({ description: 'ID do documento fiscal já analisado', example: 'a2c13519-b749-41b4-bc3c-ab64f6a9593d' })
  @IsUUID()
  documentoId: string;
}
