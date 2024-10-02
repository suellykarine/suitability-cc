import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsNumberString,
  Length,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

enum TipoDeEmpresa {
  Limitada = 'Limitada',
  SA = 'SA',
}

enum TipoPessoa {
  Juridica = 'Juridica',
}

enum Funcao {
  Investidor = 'Investidor',
}

class EnderecoDto {
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  cep: string;

  @IsNotEmpty()
  @IsString()
  rua: string;

  @IsNotEmpty()
  @IsString()
  numero: string;

  @IsOptional()
  @IsString()
  complemento: string;

  @IsNotEmpty()
  @IsString()
  bairro: string;

  @IsNotEmpty()
  @IsString()
  cidade: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  uf: string;
}

class DadosBancariosDto {
  @IsNotEmpty()
  @IsNumberString()
  codigoDoBanco: string;

  @IsNotEmpty()
  @IsNumberString()
  agencia: string;

  @IsNotEmpty()
  @IsNumberString()
  digitoDaAgencia: string;

  @IsNotEmpty()
  @IsNumberString()
  contaCorrente: string;

  @IsNotEmpty()
  @IsNumberString()
  digitoDaConta: string;
}

class TelefoneDto {
  @IsNotEmpty()
  @IsNumberString()
  @Length(11, 11)
  numero: string;

  // Como "tipo" no JSON é uma string qualquer, vou deixar livre. Se houver valores fixos, podemos usar enum.
  @IsNotEmpty()
  @IsString()
  tipo: string;
}

export class CriarInvestidorLaqusDto {
  @IsNotEmpty()
  @IsEnum(TipoDeEmpresa)
  tipoDeEmpresa: TipoDeEmpresa;

  @IsNotEmpty()
  @IsEnum(TipoPessoa)
  tipoPessoa: TipoPessoa;

  @IsNotEmpty()
  @IsEnum(Funcao)
  funcao: Funcao;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(14, 14)
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  razaoSocial: string;

  @IsNotEmpty()
  @IsString()
  atividadePrincipal: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  faturamentoMedioMensal12Meses: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco: EnderecoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DadosBancariosDto)
  dadosBancarios: DadosBancariosDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelefoneDto)
  telefones: TelefoneDto[];
}
