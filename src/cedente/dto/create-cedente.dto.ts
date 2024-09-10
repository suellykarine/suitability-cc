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
  @IsNotEmpty({ message: 'O identificador do cedente não pode estar vazio.' })
  identificadorCedente: string;

  @ApiProperty({
    description: 'Faturamento anual do cedente.',
    example: 1000000,
  })
  @IsNumber({}, { message: 'O faturamento anual deve ser um número.' })
  @IsPositive({ message: 'O faturamento anual deve ser um número positivo.' })
  faturamentoAnual: number;

  @ApiProperty({
    description: 'Código do ramo de atividade do cedente.',
    example: '2',
  })
  @IsString()
  @IsNotEmpty({
    message: 'O código do ramo de atividade não pode estar vazio.',
  })
  codigoRamoAtividade: string;

  @ApiProperty({
    description: 'Email do cedente.',
    example: 'cedente@empresa.com',
  })
  @IsEmail({}, { message: 'O email informado não é válido.' })
  email: string;
}
