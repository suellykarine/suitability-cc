// dto/create-enviar-email.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnviarEmailDto {
  @ApiProperty({
    example: 'Você foi aprovado',
    description: 'Titulo do e-mail',
  })
  @IsString()
  @IsNotEmpty()
  tituloDaMensagem: string;

  @ApiProperty({
    example: 'blabla@email.com',
    description: 'E-mail que irá receber a mensagem',
  })
  @IsEmail()
  @IsNotEmpty()
  para: string;

  @ApiProperty({
    example: 'Fundo legal',
    description: 'Nome do fundo',
  })
  @IsString()
  @IsOptional()
  nomeDoFundo?: string;

  @ApiProperty({
    example: 'aprovado',
    description: 'Tipo do email',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    example: 'http://localhost:3000/api',
    description: 'Link de redirecionamento do botão do email',
  })
  @IsString()
  @IsOptional()
  docsToSign?: string;
}
