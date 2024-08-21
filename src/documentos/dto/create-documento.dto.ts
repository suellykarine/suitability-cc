import { IsNotEmpty, IsString } from 'class-validator';

export class EnviarDocumentoDto {
  @IsNotEmpty()
  @IsString()
  tipo_documento: string;

  @IsNotEmpty()
  @IsString()
  tipo_id: string;
}
