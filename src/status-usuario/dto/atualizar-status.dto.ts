import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusUsuario } from 'src/enums/StatusUsuario';

export class AtualizarStatusUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(StatusUsuario, {
    message: 'Status inválido.',
  })
  status: string;
}
