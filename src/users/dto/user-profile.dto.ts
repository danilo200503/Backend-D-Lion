import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';


@Exclude()
export class CompanyProfileDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  cnpj: string;
}


@Exclude()
export class UserProfileDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  nome: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @Type(() => CompanyProfileDto)
  @ApiProperty({ type: CompanyProfileDto })
  company: CompanyProfileDto;

  @Expose()
  @ApiProperty({ required: false })
  cargo?: string;

  @Expose()
  @ApiProperty({ required: false })
  telefone?: string;

  @Expose()
  @ApiProperty({ required: false })
  avatar?: string;

  @Expose()
  @ApiProperty()
  ativo: boolean;

  @Expose()
  @ApiProperty({ required: false })
  ultimoLogin?: Date;

  @Expose()
  @ApiProperty({ type: [String] })
  permissoes: string[];

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
