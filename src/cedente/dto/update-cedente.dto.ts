import { PartialType } from '@nestjs/swagger';
import { CreateCedenteDto } from './create-cedente.dto';

export class UpdateCedenteDto extends PartialType(CreateCedenteDto) {}
