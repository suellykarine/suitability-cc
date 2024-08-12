import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumberString,
  IsEmail,
  Length,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateFundosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFundoDto)
  fundos: CreateFundoDto[];
}

export class CreateFundoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  razao_social: string;

  @IsString()
  @IsNotEmpty()
  nome_fantasia: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/[^\d]/g, ''))
  @Length(11, 14)
  cpf_cnpj: string;

  @IsString()
  @IsNotEmpty()
  codigo_anbima: string;

  @IsString()
  @IsOptional()
  classe_anbima?: string;

  @IsString()
  @IsOptional()
  atividade_principal?: string;

  @IsString()
  @IsOptional()
  detalhes?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/[^\d]/g, ''))
  @Length(14, 14)
  cnpj_gestor_fundo: string;

  @IsString()
  @IsNotEmpty()
  nome_backoffice: string;

  @IsEmail()
  @IsNotEmpty()
  email_backoffice: string;

  @IsString()
  @IsNotEmpty()
  telefone_backoffice: string;

  @IsString()
  @IsNotEmpty()
  nome_administrador: string;

  @IsEmail()
  @IsNotEmpty()
  email_administrador: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/[^\d]/g, ''))
  @Length(14, 14)
  cnpj_administrador: string;

  @IsString()
  @IsNotEmpty()
  telefone_administrador: string;

  @IsString()
  @IsOptional()
  nome_representante?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.replace(/[^\d]/g, ''))
  @Length(11, 11)
  cpf_representante?: string;

  @IsEmail()
  @IsOptional()
  email_representante?: string;

  @IsString()
  @IsOptional()
  telefone_representante?: string;

  @IsString()
  @IsOptional()
  cep_endereco_representante?: string;

  @IsString()
  @IsOptional()
  rua_endereco_representante?: string;

  @IsString()
  @IsOptional()
  numero_endereco_representante?: string;

  @IsString()
  @IsOptional()
  bairro_endereco_representante?: string;

  @IsString()
  @IsOptional()
  municipio_endereco_representante?: string;

  @IsString()
  @IsOptional()
  estado_endereco_representante?: string;

  @IsNumberString()
  @IsOptional()
  codigo_banco?: string;

  @IsString()
  @IsOptional()
  agencia_banco?: string;

  @IsString()
  @IsOptional()
  conta_banco?: string;

  @IsNumberString()
  @IsOptional()
  faturamento_anual?: string;
}
