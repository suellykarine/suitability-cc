import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EmissaoSerieRetornoDto {
  @ApiProperty({
    description: 'Número de emissão',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  numero_emissao: number;

  @ApiProperty({
    description: 'Número de série',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  numero_serie: number;

  @ApiProperty({
    description: 'Status da solicitação de abertura da série',
    default: 'PENDING',
  })
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';

  @ApiProperty({
    description: 'Motivo de recusa',
    example: 'A conta de custódia informada não é válida',
  })
  @IsOptional()
  motivo: string;
}
