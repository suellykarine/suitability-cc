import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCedenteDto {
  @ApiProperty({
    description:
      'O identificador do cedente (CNPJ limpo ou outro identificador único).',
    example: '12345678000199',
  })
  @IsString()
  @IsNotEmpty()
  identificadorCedente: string;

  @ApiProperty({
    description: 'Faturamento anual do cedente.',
    example: 1000000,
  })
  @IsNumber({})
  @IsPositive()
  faturamentoAnual: number;

  @ApiProperty({
    description: 'Código do ramo de atividade do cedente.',
    example: '2',
  })
  @IsString()
  @IsNotEmpty()
  codigoRamoAtividade: string;

  @ApiProperty({
    description: 'Email do cedente.',
    example: 'cedente@empresa.com',
  })
  @IsEmail()
  email: string;
}
