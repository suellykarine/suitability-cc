import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExcluirCarteiraDto {
  @ApiProperty({
    description: 'Mensagem que explica o motivo da exclusão da carteira',
    example: 'Exclusão solicitada pelo usuário devido a informações incorretas',
  })
  @IsNotEmpty()
  @IsString()
  mensagem: string;
}
