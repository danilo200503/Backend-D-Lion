import { ApiProperty } from '@nestjs/swagger';


export class EmpresaAutenticadaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  cnpj: string;
}


export class UsuarioAutenticadoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: EmpresaAutenticadaDto })
  company: EmpresaAutenticadaDto;

  @ApiProperty({ type: [String] })
  permissoes: string[];
}


export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UsuarioAutenticadoDto })
  usuario: UsuarioAutenticadoDto;
}
