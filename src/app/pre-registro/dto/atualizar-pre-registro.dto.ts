import { PartialType } from '@nestjs/swagger';
import { CriarUsuarioDto } from './criar-pre-registro.dto';

export class AtualizarPreRegistroDto extends PartialType(CriarUsuarioDto) {}
