import { PartialType } from '@nestjs/swagger';
import { CreatePreRegisterDto } from './create-pre-register.dto';

export class UpdatePreRegisterDto extends PartialType(CreatePreRegisterDto) {}
