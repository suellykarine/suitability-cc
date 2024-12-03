import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TelefoneDto {
  @ApiProperty({
    description: 'Número do telefone.',
    example: '987654321',
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'DDD do telefone.',
    example: '11',
  })
  @IsString()
  @IsNotEmpty()
  ddd: string;
}
