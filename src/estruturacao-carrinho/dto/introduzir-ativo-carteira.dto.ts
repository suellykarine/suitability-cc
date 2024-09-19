import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IntroduzirAtivoCarteiraDto {
  @ApiProperty({
    description: 'ID do ativo a ser introduzido na carteira',
    example: 456,
  })
  @IsNotEmpty()
  @IsNumber()
  ativoId: number;
}
