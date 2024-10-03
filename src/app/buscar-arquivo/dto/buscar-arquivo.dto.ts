import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuscarConteudoArquivoDto {
  @ApiProperty({
    description: 'ID do arquivo a ser buscado',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  arquivo_id: string;
}
