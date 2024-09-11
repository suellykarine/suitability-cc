import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TelefoneDto {
  @ApiProperty({
    description: 'Número do telefone.',
    example: '987654321',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'DDD do telefone.',
    example: '11',
  })
  @IsString()
  @IsNotEmpty()
  ddd: string;
}

class EnderecoDto {
  @ApiProperty({
    description: 'Estado (UF).',
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty()
  uf: string;

  @ApiProperty({
    description: 'CEP do endereço.',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  cep: string;

  @ApiProperty({
    description: 'Cidade do endereço.',
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @ApiProperty({
    description: 'Bairro do endereço.',
    example: 'Centro',
  })
  @IsString()
  @IsNotEmpty()
  bairro: string;

  @ApiProperty({
    description: 'Logradouro (rua) do endereço.',
    example: 'Rua Exemplo',
  })
  @IsString()
  @IsNotEmpty()
  logradouro: string;

  @ApiProperty({
    description: 'Número da residência.',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'Complemento do endereço.',
    example: 'Apartamento 101',
    required: false,
  })
  @IsString()
  complemento?: string;
}

export class CreateProcuradorInvestidorDto {
  @ApiProperty({
    description: 'Nome do procurador.',
    example: 'Maria Oliveira',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do procurador.',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  identificador: string;

  @ApiProperty({
    description: 'Telefone do procurador.',
  })
  @ValidateNested()
  @Type(() => TelefoneDto)
  telefone: TelefoneDto;

  @ApiProperty({
    description: 'Email do procurador.',
    example: 'maria.oliveira@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Endereço do procurador.',
  })
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco: EnderecoDto;
}
