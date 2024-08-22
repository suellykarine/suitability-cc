import { Controller, Post, Body } from '@nestjs/common';
import { EnviarEmailService } from './enviar-email.service';
import { EnviarEmailDto } from './dto/create-enviar-email.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Enviar-email')
@ApiBearerAuth('access-token')
@Controller('api/enviar-email')
export class EnviarEmailController {
  constructor(private readonly enviarEmailService: EnviarEmailService) {}

  @Post()
  enviarEmail(@Body() enviarEmailDto: EnviarEmailDto) {
    return this.enviarEmailService.enviarEmail(enviarEmailDto);
  }
}
