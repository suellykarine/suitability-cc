import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CriarContaSrmBankDto {
  @ApiProperty({
    example: '00000000000000',
    description: 'Identificador do cedente',
  })
  @IsString()
  @IsNotEmpty()
  identificador: string;
}
