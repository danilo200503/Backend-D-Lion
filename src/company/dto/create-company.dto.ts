import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

const CNPJ_REGEX = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;

export class CreateCompanyDto {
  @ApiProperty({ example: 'D-Lion Contabilidade' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  name: string;

  @ApiProperty({
    example: '00.623.904/0001-73',
    description: 'CNPJ formatado (00.000.000/0000-00) ou apenas os 14 dígitos',
  })
  @IsString()
  @Matches(CNPJ_REGEX, { message: 'Informe um CNPJ válido (formatado ou apenas dígitos).' })
  cnpj: string;
}
