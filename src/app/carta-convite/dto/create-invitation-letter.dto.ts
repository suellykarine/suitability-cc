import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, isNotEmpty } from 'class-validator';

export class CriarCartaConviteDto {
  @ApiProperty({
    example: 'Jhon Doe',
    description: 'Nome do usuário',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 'Jhon Company',
    description: 'Nome da empresa',
  })
  @IsString()
  @IsNotEmpty()
  empresa: string;

  @ApiProperty({
    example: 'jhondoe@wefin.com.br',
    description: 'email do usuário',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '53999999999',
    description: 'número de telefone do usuário',
  })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({
    example: '00000000000',
    description: 'CPF do usuário',
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({
    example: '96203693000199',
    description: 'CNPJ do usuário',
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    example: 'Olá',
    description: 'mensagem',
  })
  @IsString()
  @IsNotEmpty()
  mensagem: string;

  @ApiProperty({
    example: true,
    description: 'termos de privacidade',
  })
  @IsBoolean()
  @IsNotEmpty()
  termosAceito: boolean;
}
