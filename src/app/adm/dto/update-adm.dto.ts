import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUsuarioDto } from 'src/app/usuarios/dto/criar-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(CreateUsuarioDto) {
  id_status_usuario?: number;
}

export class AtualizarSenhaMasterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Senha atual do usuário',
    example: 'senhaAtual123',
  })
  senha_atual: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nova senha que o usuário deseja definir',
    example: 'novaSenhaSegura123!',
  })
  nova_senha: string;
}
