import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EstruturarInvestimentodiretoDto {
  @ApiProperty({
    description: 'identificador do investidor',
    example: '00 000.000/00001-00',
  })
  @IsNotEmpty()
  @IsNumber()
  identificador: string;

  @ApiProperty({
    description: 'codigoDaOperacao',
    example: 123456,
  })
  @IsNotEmpty()
  @IsNumber()
  codigoOperacao: number;
}

export class EstruturarInvestimentoDiretoResponseDto {
  @ApiProperty({ example: 'Compra formalizada com sucesso' })
  mensagem: string;

  @ApiProperty({
    example: { operacao: '123456', controle: '654321' },
    description: 'Dados da operação e controle',
  })
  data: {
    operacao: number;
    controle: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    example: 'Mensagem detalhada sobre o erro ocorrido',
    description: 'Mensagem descrevendo o motivo do erro.',
  })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
