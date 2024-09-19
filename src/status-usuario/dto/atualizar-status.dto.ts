import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarStatusUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Novo status do usuário',
    example: 'APROVADO',
  })
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(StatusUsuario, {
    message: 'Status inválido.',
  })
  status: string;
}
