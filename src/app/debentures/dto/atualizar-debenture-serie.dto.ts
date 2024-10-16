import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsDecimal } from 'class-validator';

export class AtualizarDebentureSerieDto {
  @ApiProperty({ example: 1, description: 'Número da série' })
  @IsOptional()
  @IsNumber()
  numero_serie?: number;

  @ApiProperty({ example: 1000000.0, description: 'Valor da série' })
  @IsOptional()
  @IsNumber()
  valor_serie?: number;

  @ApiProperty({ example: 500000.0, description: 'Valor investido na série' })
  @IsOptional()
  @IsNumber()
  valor_serie_investido?: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Data de emissão da série',
  })
  @IsOptional()
  @IsDateString()
  data_emissao?: string;

  @ApiProperty({
    example: '2030-01-01T00:00:00Z',
    description: 'Data de vencimento da série',
  })
  @IsOptional()
  @IsDateString()
  data_vencimento?: string;
}
