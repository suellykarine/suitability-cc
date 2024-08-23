import { Module } from '@nestjs/common';
import { EnviarEmailService } from './enviar-email.service';
import { EnviarEmailController } from './enviar-email.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EnviarEmailController],
  providers: [EnviarEmailService, PrismaService],
})
export class EnviarEmailModule {}
