import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';


export class ChangePasswordDto {
  @ApiProperty({ example: 'SenhaAtual@123' })
  @IsString()
  @IsNotEmpty({ message: 'A senha atual é obrigatória.' })
  senhaAtual: string;

  @ApiProperty({ example: 'NovaSenha@456' })
  @IsString()
  @MinLength(8, { message: 'A nova senha deve possuir no mínimo 8 caracteres.' })
  @IsStrongPassword()
  novaSenha: string;
}
