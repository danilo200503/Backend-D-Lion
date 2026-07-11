import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AnalisarDocumentoDto {
  @ApiProperty({ description: 'ID do documento fiscal (XML) já enviado via /fiscal/upload-xml', example: 'a2c13519-b749-41b4-bc3c-ab64f6a9593d' })
  @IsUUID()
  xmlId: string;
}
