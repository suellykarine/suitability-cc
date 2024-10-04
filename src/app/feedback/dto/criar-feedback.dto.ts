import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarFeedbackDto {
  @ApiProperty({
    description: 'ID do usuário do backoffice',
    example: 1,
  })
  @ApiProperty({
    description: 'ID do usuário investidor',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  id_usuario_investidor: number;

  @ApiProperty({
    description: 'ID do documento',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  id_documento: number;

  @ApiProperty({
    description: 'ID do fundo de investimento',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  id_fundo_investimento: number;

  @ApiProperty({
    description: 'Mensagem do feedback',
    example: 'Seu documento foi aprovado.',
  })
  @IsNotEmpty()
  @IsString()
  mensagem: string;
}
