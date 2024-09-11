import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TelefoneDto {
  @ApiProperty({
    description: 'Número do telefone.',
    example: '987654321',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'DDD do telefone.',
    example: '11',
  })
  @IsString()
  @IsNotEmpty()
  ddd: string;
}

export class CreateRepresentanteLegalDto {
  @ApiProperty({
    description: 'Nome do representante legal.',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do representante legal.',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty()
  identificador: string;

  @ApiProperty({
    description: 'Telefone do representante legal.',
  })
  @ValidateNested()
  @Type(() => TelefoneDto)
  telefone: TelefoneDto;

  @ApiProperty({
    description: 'Email do representante legal.',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  email: string;
}
