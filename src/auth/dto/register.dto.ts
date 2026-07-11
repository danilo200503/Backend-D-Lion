import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Maria Silva', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @ApiProperty({ example: 'maria.silva@empresa.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Qualquer senha com no mínimo 4 caracteres' })
  @IsString()
  @MinLength(4, { message: 'A senha deve possuir no mínimo 4 caracteres.' })
  senha: string;

  @ApiProperty({
    example: 'b3f1a2c4-1234-4a5b-9c8d-1234567890ab',
    description: 'Id da empresa já cadastrada (opcional). Se não for informado, uma nova empresa é criada automaticamente para o usuário.',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'O id da empresa (companyId) deve ser um UUID válido.' })
  companyId?: string;

  @ApiProperty({ example: 'Minha Empresa LTDA', required: false, description: 'Nome da nova empresa, usado apenas quando companyId não é informado.' })
  @IsOptional()
  @IsString()
  nomeEmpresa?: string;

  @ApiProperty({ example: 'Analista Contábil', required: false })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiProperty({ example: '+55 71 99999-0000', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;
}
