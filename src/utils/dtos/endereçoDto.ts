import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnderecoDto {
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
