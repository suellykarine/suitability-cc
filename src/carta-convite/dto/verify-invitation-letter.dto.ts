import { ApiProperty } from '@nestjs/swagger';

export class VerificarCodigoCartaConviteDto {
  @ApiProperty({
    example: 'jhondoe@wefin.com.br',
    description: 'email do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'c0B000',
    description: 'código de verificação',
  })
  codigo: string;
}
