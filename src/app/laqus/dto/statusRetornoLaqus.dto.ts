import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum StatusCadastro {
  Reprovado = 'Reprovado',
  Aprovado = 'Aprovado',
}

export class StatusRetornoLaqusDto {
  @ApiProperty({
    description: 'URL para onde o callback será enviado',
    example: 'https://exemplo.com/callback',
  })
  @ApiProperty({
    description: 'Status do cadastro do investidor',
    enum: StatusCadastro,
    example: StatusCadastro.Aprovado,
  })
  @IsEnum(StatusCadastro, {
    message:
      'O campo "status" deve ser um valor válido: Aprovado ou Reprovado.',
  })
  status: StatusCadastro;

  @ApiProperty({
    description: 'Identificador único do investidor',
    example: '123456',
  })
  @IsString({
    message: 'O campo "identificadorInvestidor" deve ser uma string válida.',
  })
  @IsNotEmpty({ message: 'O campo "identificadorInvestidor" é obrigatório.' })
  identificadorInvestidor: string;

  @ApiProperty({
    description: 'Justificativa para o status, caso necessário',
    example: 'Justificativa de exemplo',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O campo "justificativa" deve ser uma string válida.' })
  justificativa?: string;

  @ApiProperty({
    description: 'Data de conclusão do processo',
    example: '2024-10-21T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'O campo "concluidoEm" deve ser uma data válida no formato ISO 8601.',
    },
  )
  concluidoEm?: Date;
}
