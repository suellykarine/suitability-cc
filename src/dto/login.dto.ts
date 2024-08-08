import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Senha do usuário',
  })
  senha: string;
}
