import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BuscarStatusLaqusDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uuid de investidor.',
    example: 'a75b9d13-ac83-4ae4-8755-a3f18dc6d5b3',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Token De authenticação.',
    example: 'SHbvR9HhmlOBBYGhVAP2M8XS3LaQrJ8dy06v3VeMdpGxSF3wpOvMa4tkPWOq5MO2',
  })
  token: string;
}
