import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório.' })
  token: string;

  @ApiProperty({ example: 'novaSenha123' })
  @IsString()
  @MinLength(4, { message: 'A senha deve possuir no mínimo 4 caracteres.' })
  novaSenha: string;
}
