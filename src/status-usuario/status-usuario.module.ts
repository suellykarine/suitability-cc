import { Module } from '@nestjs/common';
import { StatusUsuarioService } from './status-usuario.service';
import { StatusUsuarioController } from './status-usuario.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [StatusUsuarioController],
  providers: [StatusUsuarioService, PrismaService],
})
export class StatusUsuarioModule {}
