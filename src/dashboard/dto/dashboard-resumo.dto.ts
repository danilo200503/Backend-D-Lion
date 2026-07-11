import { ApiProperty } from '@nestjs/swagger';


export class UploadRecenteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nomeArquivo: string;

  @ApiProperty()
  usuario: string;

  @ApiProperty()
  criadoEm: Date;
}


export class LoginRecenteDto {
  @ApiProperty()
  usuario: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  ultimoLogin: Date;
}


export class DashboardResumoDto {
  @ApiProperty({ description: 'Quantidade total de usuários cadastrados' })
  totalUsuarios: number;

  @ApiProperty({ description: 'Quantidade total de empresas distintas cadastradas' })
  totalEmpresas: number;

  @ApiProperty({ description: 'Quantidade de arquivos XML enviados (placeholder até o módulo de uploads existir)' })
  totalXmlEnviados: number;

  @ApiProperty({ description: 'Quantidade de análises realizadas (placeholder até o módulo de análises existir)' })
  totalAnalises: number;

  @ApiProperty({ description: 'Quantidade de pendências abertas (placeholder até o módulo existir)' })
  totalPendencias: number;

  @ApiProperty({ type: [String], description: 'Lista de empresas cadastradas no sistema' })
  empresas: string[];

  @ApiProperty({ type: [UploadRecenteDto] })
  ultimosUploads: UploadRecenteDto[];

  @ApiProperty({ type: [LoginRecenteDto] })
  ultimosLogins: LoginRecenteDto[];
}
