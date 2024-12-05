import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumberString,
  Length,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarFundoDto {
  @ApiProperty({
    example: 'Fundo Alpha',
    description: 'Nome do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({
    example: 'Fundo Alpha S.A.',
    description: 'Razão social do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  razao_social?: string;

  @ApiProperty({
    example: 'Alpha',
    description: 'Nome fantasia do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome_fantasia?: string;

  @ApiProperty({
    example: '12345678000195',
    description: 'CPF ou CNPJ do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(11, 14)
  cpf_cnpj?: string;

  @ApiProperty({
    example: 'A123',
    description: 'Código ANBIMA do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  codigo_anbima?: string;

  @ApiProperty({
    example: 'Renda Fixa',
    description: 'Classe ANBIMA do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  classe_anbima?: string;

  @ApiProperty({
    example: 'Investimentos em renda fixa',
    description: 'Atividade principal do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  atividade_principal?: string;

  @ApiProperty({
    example: 'Fundo focado em investimentos seguros de renda fixa',
    description: 'Detalhes adicionais sobre o fundo de investimento',
  })
  @IsString()
  @IsOptional()
  detalhes?: string;

  @ApiProperty({
    example: '98765432000188',
    description: 'CNPJ do gestor do fundo de investimento',
  })
  @ApiProperty({
    example: 'Backoffice Alpha',
    description: 'Nome do backoffice do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome_backoffice?: string;

  @ApiProperty({
    example: 'backoffice.alpha@empresa.com',
    description: 'Email do backoffice do fundo de investimento',
  })
  @IsEmail()
  @IsOptional()
  email_backoffice?: string;

  @ApiProperty({
    example: '11987654321',
    description: 'Telefone do backoffice do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  telefone_backoffice?: string;

  @ApiProperty({
    example: 'Administrador Alpha',
    description: 'Nome do administrador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome_administrador?: string;

  @ApiProperty({
    example: 'admin.alpha@empresa.com',
    description: 'Email do administrador do fundo de investimento',
  })
  @IsEmail()
  @IsOptional()
  email_administrador?: string;

  @ApiProperty({
    example: '11223344000166',
    description: 'CNPJ do administrador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(14, 14)
  cnpj_administrador?: string;

  @ApiProperty({
    example: '11987654322',
    description: 'Telefone do administrador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  telefone_administrador?: string;

  @ApiProperty({
    example: 'Representante Alpha',
    description: 'Nome do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome_representante?: string;

  @ApiProperty({
    example: '12345678901',
    description: 'CPF do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(11, 11)
  cpf_representante?: string;

  @ApiProperty({
    example: 'representante.alpha@empresa.com',
    description: 'Email do representante do fundo de investimento',
  })
  @IsEmail()
  @IsOptional()
  email_representante?: string;

  @ApiProperty({
    example: '11987654323',
    description: 'Telefone do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  telefone_representante?: string;

  @ApiProperty({
    example: '12345678',
    description: 'CEP do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  cep_endereco_representante?: string;

  @ApiProperty({
    example: 'Rua Exemplo',
    description: 'Rua do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  rua_endereco_representante?: string;

  @ApiProperty({
    example: '1001',
    description: 'Número do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  numero_endereco_representante?: string;

  @ApiProperty({
    example: 'Centro',
    description: 'Bairro do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  bairro_endereco_representante?: string;

  @ApiProperty({
    example: 'São Paulo',
    description:
      'Município do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  municipio_endereco_representante?: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado do endereço do representante do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  estado_endereco_representante?: string;

  @ApiProperty({
    example: '001',
    description: 'Código do banco da conta de repasse do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  codigo_banco?: string;

  @ApiProperty({
    example: '1234',
    description:
      'Agência bancária da conta de repasse do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  agencia_banco?: string;

  @ApiProperty({
    example: '56789-0',
    description: 'Conta bancária de repasse do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  conta_banco?: string;

  @ApiProperty({
    example: '2000000',
    description: 'Faturamento anual do fundo de investimento',
  })
  @IsNumberString()
  @IsOptional()
  faturamento_anual?: string;

  @ApiProperty({
    example: 'ATIVO',
    description: 'Status atual do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'Proc EC',
    description: 'Nome do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  nome_procurador?: string;

  @ApiProperty({
    example: '54488945007',
    description: 'CPF do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @Length(11, 11)
  cpf_procurador?: string;

  @ApiProperty({
    example: '5511941111111',
    description: 'Telefone do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  telefone_procurador?: string;

  @ApiProperty({
    example: 'procecc@teste.com',
    description: 'Email do procurador do fundo de investimento',
  })
  @IsEmail()
  @IsOptional()
  email_procurador?: string;

  @ApiProperty({
    example: '04830050',
    description: 'CEP do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  cep_endereco_procurador?: string;

  @ApiProperty({
    example: 'Rua Castel Gandolfo',
    description: 'Rua do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  rua_endereco_procurador?: string;

  @ApiProperty({
    example: '4321',
    description: 'Número do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  numero_endereco_procurador?: string;

  @ApiProperty({
    example: 'Vila Progresso (Zona Sul)',
    description: 'Bairro do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  bairro_endereco_procurador?: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Município do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  municipio_endereco_procurador?: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado do endereço do procurador do fundo de investimento',
  })
  @IsString()
  @IsOptional()
  estado_endereco_procurador?: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o fundo está apto para debêntures',
  })
  @IsBoolean()
  @IsOptional()
  apto_debenture?: boolean;

  @ApiProperty({
    example: '2000000',
    description: 'Valor da série de debêntures',
  })
  @IsNumberString()
  @IsOptional()
  valor_serie_debenture?: number;
}
