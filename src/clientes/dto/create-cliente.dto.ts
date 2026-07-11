import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  nome: string;

  @ApiProperty({ example: 'Plastfoam Ind. e Com. de Plásticos Ltda', required: false })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({ example: '12345678000199', required: false })
  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @ApiProperty({ example: 'maria@empresa.com.br', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @ApiProperty({ example: '11987654321', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;
}
