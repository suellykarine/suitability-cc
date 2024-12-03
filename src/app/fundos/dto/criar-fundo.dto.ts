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

export class CriarFundoDto {
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
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
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
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
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
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(14, 14)
  cnpj_administrador: string;

  @IsString()
  @IsNotEmpty()
  telefone_administrador: string;

  @IsString()
  @IsNotEmpty()
  nome_representante?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(11, 11)
  cpf_representante?: string;

  @IsEmail()
  @IsNotEmpty()
  email_representante?: string;

  @IsString()
  @IsNotEmpty()
  telefone_representante?: string;

  @IsString()
  @IsNotEmpty()
  cep_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  rua_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  numero_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  bairro_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  municipio_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  estado_endereco_representante?: string;

  @IsString()
  @IsNotEmpty()
  codigo_banco?: string;

  @IsString()
  @IsNotEmpty()
  agencia_banco?: string;

  @IsString()
  @IsNotEmpty()
  conta_banco?: string;

  @IsNumberString()
  @IsNotEmpty()
  faturamento_anual?: string;

  @IsString()
  @IsNotEmpty()
  nome_procurador?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(11, 11)
  cpf_procurador?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  telefone_procurador?: string;

  @IsEmail()
  @IsNotEmpty()
  email_procurador?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  cep_endereco_procurador?: string;

  @IsNotEmpty()
  @IsOptional()
  rua_endereco_procurador?: string;

  @IsNotEmpty()
  @IsOptional()
  numero_endereco_procurador?: string;

  @IsNotEmpty()
  @IsOptional()
  bairro_endereco_procurador?: string;

  @IsNotEmpty()
  @IsOptional()
  municipio_endereco_procurador?: string;

  @IsNotEmpty()
  @IsOptional()
  estado_endereco_procurador?: string;
}
export class CriarFundosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriarFundoDto)
  @ApiProperty({
    type: [CriarFundoDto],
    description: 'Array de fundos para serem criados',
    example: [
      {
        nome: 'Fundo Beta',
        razao_social: 'Fundo Beta S.A.',
        nome_fantasia: 'Beta',
        cpf_cnpj: '22345678000195',
        codigo_anbima: 'B123',
        classe_anbima: 'Multimercado',
        atividade_principal: 'Investimentos em múltiplos mercados',
        detalhes: 'Fundo diversificado com alocação em múltiplos ativos',
        cnpj_gestor_fundo: '98765432000199',
        nome_backoffice: 'Backoffice Beta',
        email_backoffice: 'backoffice.beta@empresa.com',
        telefone_backoffice: '11988776655',
        nome_administrador: 'Administrador Beta',
        email_administrador: 'admin.beta@empresa.com',
        cnpj_administrador: '11223344000177',
        telefone_administrador: '11987654333',
        nome_representante: 'Representante Beta',
        cpf_representante: '22345678901',
        email_representante: 'representante.beta@empresa.com',
        telefone_representante: '11987654344',
        cep_endereco_representante: '87654321',
        rua_endereco_representante: 'Avenida Exemplo',
        numero_endereco_representante: '2000',
        bairro_endereco_representante: 'Jardim',
        municipio_endereco_representante: 'Rio de Janeiro',
        estado_endereco_representante: 'RJ',
        codigo_banco: '237',
        agencia_banco: '4321',
        conta_banco: '98765-0',
        faturamento_anual: '2000000',
        nome_procurador: 'Procurador Beta',
        cpf_procurador: '33456789012',
        telefone_procurador: '11987654355',
        email_procurador: 'procurador.beta@empresa.com',
        cep_endereco_procurador: '12345679',
        rua_endereco_procurador: 'Rua Nova Exemplo',
        numero_endereco_procurador: '1500',
        bairro_endereco_procurador: 'Vila Nova',
        municipio_endereco_procurador: 'Curitiba',
        estado_endereco_procurador: 'PR',
      },
    ],
  })
  fundos: CriarFundoDto[];
}
