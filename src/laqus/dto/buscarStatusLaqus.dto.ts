import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BuscarStatusLaqusDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'a75b9d13-ac83-4ae4-8755-a3f18dc6d5b3',
    description: 'Uuid de investidor.',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'SHbvR9HhmlOBBYGhVAP2M8XS3LaQrJ8dy06v3VeMdpGxSF3wpOvMa4tkPWOq5MO2',
    description: 'Token De authenticação.',
  })
  token: string;
}
