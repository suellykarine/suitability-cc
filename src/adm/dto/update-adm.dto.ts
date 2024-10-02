import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUsuarioDto } from 'src/usuarios/dto/criar-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(CreateUsuarioDto) {}

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
