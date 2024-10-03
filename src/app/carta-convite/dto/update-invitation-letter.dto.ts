import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CriarCartaConviteDto } from './create-invitation-letter.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AtualizarCartaConviteDto extends PartialType(
  CriarCartaConviteDto,
) {
  @ApiProperty({
    example: 'APROVADO',
    description: 'Status da carta convite',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: '1',
    description: 'Id do usuário backoffice que irá analisar o usuário',
  })
  @IsNumber()
  @IsNotEmpty()
  idBackoffice: number;
}
