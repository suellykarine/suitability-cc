import { ApiProperty } from '@nestjs/swagger';

export class CreatePreRegisterDto {
  @ApiProperty({
    example: '123456Jo@',
    description: 'Senha que será cadastrada',
  })
  senha: string;
}

export class CreateVerificationCodeDto {
  @ApiProperty({
    example: 'email@wefin.com.br',
    description: 'Email para onde o código será enviado',
  })
  email: string;
}
