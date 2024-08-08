import { ApiProperty } from '@nestjs/swagger';

export class CriarUsuarioDto {
  @ApiProperty({
    example: '123456Jo@',
    description: 'Senha que será cadastrada',
  })
  senha: string;
}

export class CriarCodigoDeVerificacaoDto {
  @ApiProperty({
    example: 'email@wefin.com.br',
    description: 'Email para onde o código será enviado',
  })
  email: string;
}
