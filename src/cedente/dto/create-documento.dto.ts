import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentoDto {
  @ApiProperty({
    description: 'Identificador do Cedente (CNPJ)',
    example: '12345678000199',
  })
  @IsString()
  @IsNotEmpty()
  identificadorCedente: string;

  @ApiProperty({
    description: 'Tipo de Pessoa (CEDENTE ou PROCURADOR)',
    example: 'CEDENTE',
  })
  @IsString()
  @IsNotEmpty()
  tipoPessoa: string;

  @ApiProperty({
    description: 'Tipo do documento enviar',
    example: 'CARTAO_CNPJ',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  documento: string;

  @ApiProperty({
    description: 'Identificador do Procurador (CPF), se aplicável',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  identificadorPessoa?: string;
}
