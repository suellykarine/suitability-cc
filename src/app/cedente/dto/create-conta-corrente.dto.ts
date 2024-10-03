import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class FavorecidoDto {
  @ApiProperty({
    description: 'O identificador do favorecido (CNPJ).',
    example: '12345678000199',
  })
  @IsString()
  @IsNotEmpty()
  identificador: string;

  @ApiProperty({
    description: 'O nome do favorecido.',
    example: 'Nome do Favorecido',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

class DadosBancariosDto {
  @ApiProperty({
    description: 'Indica se a conta é do tipo PIX.',
    example: false,
  })
  @IsBoolean()
  pix: boolean;

  @ApiProperty({
    description: 'O tipo de conta bancária (PAGAMENTO ou outra).',
    example: 'PAGAMENTO',
  })
  @IsString()
  @IsNotEmpty()
  tipoConta: string;

  @ApiProperty({
    description: 'Descrição da conta bancária.',
    example: 'Conta corrente Nome do Favorecido',
    required: false,
  })
  @IsOptional()
  @IsString()
  descricaoConta?: string;

  @ApiProperty({
    description: 'Código do banco.',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  bancoCodigo: number;

  @ApiProperty({
    description: 'Agência bancária.',
    example: '0001',
  })
  @IsString()
  @IsNotEmpty()
  agencia: string;

  @ApiProperty({
    description: 'Número da conta corrente.',
    example: '1234567',
  })
  @IsString()
  @IsNotEmpty()
  contaCorrente: string;

  @ApiProperty({
    description: 'Dígito verificador da conta corrente.',
    example: '8',
    required: false,
  })
  @IsOptional()
  @IsString()
  contaCorrenteDigitoVerificador?: string;
}

export class CreateContaCorrenteDto {
  @ApiProperty({
    description: 'Dados do favorecido.',
  })
  @IsNotEmpty()
  @Type(() => FavorecidoDto)
  @ValidateNested()
  favorecido: FavorecidoDto;

  @ApiProperty({
    description: 'Dados bancários.',
  })
  @IsNotEmpty()
  @Type(() => DadosBancariosDto)
  @ValidateNested()
  dadosBancarios: DadosBancariosDto;
}
