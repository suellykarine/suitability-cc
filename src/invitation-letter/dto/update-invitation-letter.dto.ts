import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateInvitationLetterDto } from './create-invitation-letter.dto';

export class UpdateInvitationLetterDto extends OmitType(
  CreateInvitationLetterDto,
  ['termosAceito'] as const,
) {
  @ApiProperty({
    example: 'APROVADO',
    description: 'Status da carta convite',
  })
  status: string;

  @ApiProperty({
    example: '1',
    description: 'Id do usuário backoffice que irá analisar o usuário',
  })
  idBackoffice: number;
}
