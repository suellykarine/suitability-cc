import { PartialType } from '@nestjs/swagger';
import { AdmCreateUsuarioDto } from './create-adm.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarUsuarioDto extends PartialType(AdmCreateUsuarioDto) {}

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
