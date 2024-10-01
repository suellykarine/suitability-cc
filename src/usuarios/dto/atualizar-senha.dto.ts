import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarSenhaDto {
  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha123',
  })
  @IsNotEmpty()
  @IsString()
  senha: string;
}
