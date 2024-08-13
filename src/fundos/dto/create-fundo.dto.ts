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
import { ApiProperty } from '@nestjs/swagger';

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
export class CreateFundosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFundoDto)
  @ApiProperty({
    type: [CreateFundoDto],
    description: 'Array de fundos para serem criados',
    example: [
      {
        nome: 'Fundo Alpha',
        razao_social: 'Fundo Alpha S.A.',
        nome_fantasia: 'Alpha',
        cpf_cnpj: '12345678000195',
        codigo_anbima: 'A123',
        classe_anbima: 'Ações',
        atividade_principal: 'Investimentos em ações',
        detalhes:
          'Fundo voltado para investimentos em ações de alta performance',
        cnpj_gestor_fundo: '98765432000188',
        nome_backoffice: 'Backoffice Alpha',
        email_backoffice: 'backoffice.alpha@empresa.com',
        telefone_backoffice: '1122334455',
        nome_administrador: 'Administrador Alpha',
        email_administrador: 'admin.alpha@empresa.com',
        cnpj_administrador: '11223344000166',
        telefone_administrador: '11987654321',
        nome_representante: 'Representante Alpha',
        cpf_representante: '12345678901',
        email_representante: 'representante.alpha@empresa.com',
        telefone_representante: '11987654322',
        cep_endereco_representante: '12345678',
        rua_endereco_representante: 'Rua Exemplo',
        numero_endereco_representante: '1000',
        bairro_endereco_representante: 'Centro',
        municipio_endereco_representante: 'São Paulo',
        estado_endereco_representante: 'SP',
        codigo_banco: '001',
        agencia_banco: '1234',
        conta_banco: '56789-0',
        faturamento_anual: '1000000',
      },
    ],
  })
  fundos: CreateFundoDto[];
}
