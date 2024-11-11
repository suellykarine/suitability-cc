import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CriarDebentureSerieDto {
  @ApiProperty({ example: 2000000, description: 'Valor total da série' })
  @IsNumber()
  @IsOptional()
  valorEntrada: number;
}
