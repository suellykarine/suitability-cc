import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CodigoOperacaoDto {
  @ApiProperty({
    example: 10,
    description: 'Transação gerada na estruturação do investimento',
  })
  @IsNumber()
  codigoOperacao: number;
}
