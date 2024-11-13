import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CriarDebentureSerieDto {
  @ApiProperty({ example: 2000000, description: 'Valor total da série' })
  @IsNumber()
  valorEntrada: number;

  @ApiProperty({
    example: 123456789,
    description: 'Identificador do fundo',
  })
  @IsNumber()
  identificadorFundo: number;
}
