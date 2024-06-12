import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationLetterDto {
  @ApiProperty({
    example: 'Jhon Doe',
    description: 'Nome do usuário',
  })
  nome: string;

  @ApiProperty({
    example: 'Jhon Company',
    description: 'Nome da empresa',
  })
  empresa: string;

  @ApiProperty({
    example: 'jhondoe@wefin.com.br',
    description: 'email do usuário',
  })
  email: string;

  @ApiProperty({
    example: '53999999999',
    description: 'número de telefone do usuário',
  })
  telefone: string;

  @ApiProperty({
    example: '00000000000',
    description: 'CPF do usuário',
  })
  cpf: string;

  @ApiProperty({
    example: '96203693000199',
    description: 'CNPJ do usuário',
  })
  cnpj: string;

  @ApiProperty({
    example: 'Olá',
    description: 'mensagem',
  })
  mensagem: string;

  @ApiProperty({
    example: true,
    description: 'termos de privacidade',
  })
  termosAceito: boolean;
}
