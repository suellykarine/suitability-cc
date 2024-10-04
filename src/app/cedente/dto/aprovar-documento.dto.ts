import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AprovarDocumentoDto {
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
    description: 'Parecer de Aprovação do Documento',
    example: 'Documento dentro das exigências',
    default: 'Documento dentro das exigências',
  })
  @IsString()
  @IsNotEmpty()
  parecerAprovacao: string = 'Documento dentro das exigências';

  @ApiProperty({
    description: 'Identificador do Procurador (CPF)',
    example: '12345678900',
    required: false,
  })
  @IsOptional()
  @IsString()
  identificadorPessoa?: string;
}
