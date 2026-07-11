import { PartialType } from '@nestjs/swagger';
import { CreateCobrancaDto } from './create-cobranca.dto';

export class UpdateCobrancaDto extends PartialType(CreateCobrancaDto) {}
