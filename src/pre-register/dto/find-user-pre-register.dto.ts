import { ApiProperty } from '@nestjs/swagger';

export class FindUserPreRegisterDto {
  @ApiProperty({
    example: 'jhon.doe@wefin.com.br',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: '000.000.000-00',
    description: 'CPF do usuário',
  })
  cpf: string;

  @ApiProperty({
    example: '+55 (00) 00000-0000',
    description: 'telefone do usuário',
  })
  telefone: string;
}
