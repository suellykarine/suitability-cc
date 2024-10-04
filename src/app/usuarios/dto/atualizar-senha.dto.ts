import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AtualizarSenhaDto {
  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha123',
  })
  @IsNotEmpty()
  @IsString()
  senha: string;
}
