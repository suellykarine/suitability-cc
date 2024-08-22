import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnviarDocumentoDto {
  @ApiProperty({
    description: 'Tipo do documento que está sendo enviado',
    example: 'Regulamento',
  })
  @IsNotEmpty()
  @IsString()
  tipo_documento: string;

  @ApiProperty({
    description: 'Identificador do tipo (por exemplo, ID do fundo ou usuário)',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  tipo_id: string;
}

export class AnexarDocumentoDto {
  @ApiProperty({
    description: 'Extensão do arquivo do documento',
    example: 'pdf',
  })
  @IsString()
  @IsNotEmpty()
  extensao: string;

  @ApiProperty({
    description: 'Nome original do arquivo do documento',
    example: 'regulamento_fundo_alpha.pdf',
  })
  @IsString()
  @IsNotEmpty()
  nome_arquivo: string;

  @ApiProperty({
    description: 'Tipo do documento anexado',
    example: 'Regulamento',
  })
  @IsString()
  @IsNotEmpty()
  tipo_documento: string;

  @ApiProperty({
    description: 'URL onde o documento está armazenado',
    example: 'https://exemplo.com/documentos/regulamento_fundo_alpha.pdf',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
