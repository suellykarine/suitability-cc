import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum StatusRetornoRemessa {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}
type TitulosRejeitados = {
  titulo_id: string;
  motivo_rejeicao: string;
};

export class EmissaoRemessaRetornoDto {
  @ApiProperty({
    description: 'Número remessa',
    example: '321',
  })
  @IsNotEmpty()
  @IsString()
  numero_remessa: string;

  @ApiProperty({
    description: 'Status retorno',
    example: 'PENDING',
  })
  @IsNotEmpty()
  @IsEnum(StatusRetornoRemessa)
  status: StatusRetornoRemessa;

  @ApiProperty({
    description: 'Titulos rejeitados.(Apenas para status FAILURE)',
    example: [
      {
        titulo_id: '549b02fb',
        motivo_rejeicao:
          'Data de vencimento (2032-12-31) ultrapassa o data limite para essa operação',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  titulos_rejeitados: TitulosRejeitados[];
}
export class EmissaoRemessaDto {
  @ApiProperty({
    description: 'Número debênture',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  numero_debenture: number;
  @ApiProperty({
    description: 'Número série',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  numero_serie: number;

  @ApiProperty({
    description: 'Código da operação',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  codigo_operacao: number;
}
