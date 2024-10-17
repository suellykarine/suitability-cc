import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CriarDebentureDto {
  @ApiProperty({ example: 1, description: 'Número da debenture' })
  @IsNumber()
  @IsNotEmpty()
  numero_debenture: number;

  @ApiProperty({
    example: 'Debenture Exemplo',
    description: 'Nome da debenture',
  })
  @IsString()
  @IsNotEmpty()
  nome_debenture: string;

  @ApiProperty({ example: 50000000, description: 'Valor total da debenture' })
  @IsNumber()
  @IsNotEmpty()
  valor_debenture: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de emissão da debenture',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  data_emissao: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Data de vencimento da debenture',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  data_vencimento: Date;
}
