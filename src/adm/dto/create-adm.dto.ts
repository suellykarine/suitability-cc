import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdmCreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nome do administrador',
    example: 'João da Silva',
  })
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email do administrador',
    example: 'joao.silva@empresa.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Senha do administrador',
    example: 'senhaSegura123!',
  })
  senha: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tipo de usuário do administrador',
    example: 'ADMIN',
  })
  tipo_usuario: string;

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @ApiProperty({
    description: 'Telefone do administrador (opcional)',
    example: '(11) 98765-4321',
  })
  telefone?: string;

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }) => typeof value === 'string' && value.replace(/[^\d]/g, ''),
  )
  @ApiProperty({
    description: 'CPF do administrador (opcional)',
    example: '000.000.000-00',
  })
  cpf?: string;
}
