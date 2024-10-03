import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContatoDto {
  @ApiProperty({
    description: 'Nome do contato.',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Telefone do contato.',
    example: '987654321',
  })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({
    description: 'DDD do contato.',
    example: '11',
  })
  @IsString()
  @IsNotEmpty()
  ddd: string;

  @ApiProperty({
    description: 'Email do contato.',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Tipo de contato.',
    example: 'COMERCIAL',
  })
  @IsString()
  @IsNotEmpty()
  tipoContato: string;
}
