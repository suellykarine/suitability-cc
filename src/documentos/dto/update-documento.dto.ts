import { PartialType } from '@nestjs/swagger';
import { EnviarDocumentoDto } from './create-documento.dto';

export class UpdateDocumentoDto extends PartialType(EnviarDocumentoDto) {}
