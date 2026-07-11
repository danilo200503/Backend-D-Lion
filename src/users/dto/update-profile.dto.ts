import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';


export class UpdateProfileDto {
  @ApiProperty({ example: 'Maria Silva', required: false })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({ example: 'Analista Contábil', required: false })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiProperty({ example: '+55 71 99999-0000', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'https://cdn.dlion.com.br/avatars/user.png', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
