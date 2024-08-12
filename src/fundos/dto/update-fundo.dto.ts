import { PartialType } from '@nestjs/swagger';
import { CreateFundoDto } from './create-fundo.dto';

export class UpdateFundoDto extends PartialType(CreateFundoDto) {}
