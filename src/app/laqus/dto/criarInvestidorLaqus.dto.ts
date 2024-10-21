import {
  Min,
  Length,
  IsEnum,
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
  ValidateNested,
  validate,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidarCNPJ } from 'src/utils/validadores/validarCnpjECpf';
import { ValidarCEP } from 'src/utils/validadores/validarCep';

enum TipoDeEmpresa {
  SA = 'SA',
  Limitada = 'Limitada',
}

enum TipoPessoa {
  Juridica = 'Juridica',
}

enum Funcao {
  Investidor = 'Investidor',
}

class EnderecoDto {
  @ApiProperty({
    maxLength: 8,
    minLength: 8,
    example: '12345678',
    description: 'CEP do endereço (sem hífen)',
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 8, {
    message: 'CEP deve ter exatamente 8 dígitos numéricos.',
  })
  @Validate(ValidarCEP)
  cep: string;

  @ApiProperty({
    example: 'Rua dos Desenvolvedores',
    description: 'Nome da rua',
  })
  @IsNotEmpty()
  @IsString()
  rua: string;

  @ApiProperty({
    example: '100',
    description: 'Número da residência',
  })
  @IsNotEmpty()
  @IsString()
  numero: string;

  @ApiProperty({
    example: 'Apt 101',
    description: 'Complemento (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  complemento: string;

  @ApiProperty({
    example: 'Centro',
    description: 'Bairro do endereço',
  })
  @IsNotEmpty()
  @IsString()
  bairro: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade do endereço',
  })
  @IsNotEmpty()
  @IsString()
  cidade: string;

  @ApiProperty({
    example: 'SP',
    description: 'Estado (UF) do endereço',
    minLength: 2,
    maxLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  uf: string;
}

class DadosBancariosDto {
  @ApiProperty({
    example: '001',
    description: 'Código do banco',
  })
  @IsNotEmpty()
  @IsNumberString()
  codigoDoBanco: string;

  @ApiProperty({
    example: '1234',
    description: 'Número da agência',
  })
  @IsNotEmpty()
  @IsNumberString()
  agencia: string;

  @ApiProperty({
    example: '9',
    description: 'Dígito da agência',
  })
  @IsNotEmpty()
  @IsNumberString()
  digitoDaAgencia: string;

  @ApiProperty({
    example: '987654',
    description: 'Número da conta corrente',
  })
  @IsNotEmpty()
  @IsNumberString()
  contaCorrente: string;

  @ApiProperty({
    example: '1',
    description: 'Dígito da conta corrente',
  })
  @IsNotEmpty()
  @IsNumberString()
  digitoDaConta: string;
}

class TelefoneDto {
  @ApiProperty({
    example: '11987654321',
    description: 'Número de telefone com DDD',
    minLength: 11,
    maxLength: 11,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(11, 11)
  numero: string;

  @ApiProperty({
    example: 'Celular',
    description: 'Tipo do telefone (e.g., Fixo, Celular)',
  })
  @IsNotEmpty()
  @IsString()
  tipo: string;
}

export class CriarInvestidorLaqusDto {
  @ApiProperty({
    example: 'Limitada',
    description: 'Tipo de empresa (Limitada ou SA)',
  })
  @IsNotEmpty()
  @IsEnum(TipoDeEmpresa)
  tipoDeEmpresa: TipoDeEmpresa;

  @ApiProperty({
    example: 'Juridica',
    description: 'Tipo de pessoa (Jurídica)',
  })
  @IsNotEmpty()
  @IsEnum(TipoPessoa)
  tipoPessoa: TipoPessoa;

  @ApiProperty({
    example: 'Investidor',
    description: 'Função no sistema',
  })
  @IsNotEmpty()
  @IsEnum(Funcao)
  funcao: Funcao;

  @ApiProperty({
    example: 'investidor@example.com',
    description: 'Endereço de email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678000195',
    description: 'CNPJ da empresa (14 dígitos)',
    minLength: 14,
    maxLength: 14,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Length(14, 14)
  @Validate(ValidarCNPJ)
  cnpj: string;

  @ApiProperty({
    example: 'Minha Empresa LTDA',
    description: 'Razão social da empresa',
  })
  @IsNotEmpty()
  @IsString()
  razaoSocial: string;

  @ApiProperty({
    example: 'Atividades de consultoria em TI',
    description: 'Atividade principal da empresa',
  })
  @IsNotEmpty()
  @IsString()
  atividadePrincipal: string;

  @ApiProperty({
    example: 500000,
    description: 'Faturamento médio mensal nos últimos 12 meses',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  faturamentoMedioMensal12Meses: number;

  @ApiProperty({
    type: EnderecoDto,
    description: 'Dados do endereço da empresa',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco: EnderecoDto;

  @ApiProperty({
    type: DadosBancariosDto,
    description: 'Dados bancários da empresa',
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DadosBancariosDto)
  dadosBancarios: DadosBancariosDto;

  @ApiProperty({
    type: [TelefoneDto],
    description: 'Lista de telefones de contato',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelefoneDto)
  telefones: TelefoneDto[];
}
