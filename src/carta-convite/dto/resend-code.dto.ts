import { ApiProperty } from '@nestjs/swagger';

export class ReenviarCodigoDto {
  @ApiProperty({
    example: 'jhondoe@wefin.com.br',
    description: 'email do usuário',
  })
  email: string;
}
