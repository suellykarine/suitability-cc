import { Module } from '@nestjs/common';
import { PreRegistroService } from './pre-registro.service';
import { PreRegistroController } from './pre-registro.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [PreRegistroController],
  providers: [PreRegistroService, PrismaService],
})
export class PreRegistroModule {}
