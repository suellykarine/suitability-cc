import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstruturacaoCarrinhoDto {
  @ApiProperty({
    description: 'Identificador do cedente (CNPJ do fundo)',
    example: '00.000.000/0000-00',
  })
  @IsString()
  @IsNotEmpty()
  cedenteIdentificador: string;

  @ApiProperty({
    description: 'Código de controle do parceiro',
    example: 'NomeDaCarteira',
  })
  @IsString()
  @IsNotEmpty()
  codigoControleParceiro: string;

  @ApiProperty({
    description: 'ID da operação',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  operacaoId: number;
}
