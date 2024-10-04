import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReenviarCodigoDto {
  @ApiProperty({
    example: 'jhondoe@wefin.com.br',
    description: 'email do usuário',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
