import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtualizarDocumentoStatusDto {
  @ApiProperty({
    description: 'Mensagem opcional para feedback sobre o documento',
    example: 'O documento está incompleto, por favor, revise.',
  })
  @IsOptional()
  @IsString()
  mensagem?: string;

  @ApiProperty({
    description: 'Status do documento que está sendo atualizado',
    example: 'Aprovado',
  })
  @IsNotEmpty()
  @IsString()
  status: string;
}
