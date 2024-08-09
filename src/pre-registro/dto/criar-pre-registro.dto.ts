import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CriarUsuarioDto {
  @ApiProperty({
    example: '123456Jo@',
    description: 'Senha que será cadastrada',
  })
  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class CriarCodigoDeVerificacaoDto {
  @ApiProperty({
    example: 'email@wefin.com.br',
    description: 'Email para onde o código será enviado',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
