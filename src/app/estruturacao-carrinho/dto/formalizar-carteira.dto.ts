import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FormalizarCarteiraDto {
  @ApiProperty({
    description: 'Tipo de estruturação da carteira',
    example: 'Direto',
  })
  @IsNotEmpty()
  @IsString()
  tipoEstruturacao: string;
}
