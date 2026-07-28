import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'maria.silva@empresa.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;
}
