import { Module } from '@nestjs/common';
import { EnviarEmailService } from './enviar-email.service';
import { EnviarEmailController } from './enviar-email.controller';

@Module({
  controllers: [EnviarEmailController],
  providers: [EnviarEmailService],
})
export class EnviarEmailModule {}
