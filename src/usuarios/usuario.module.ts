import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [UsuarioService, PrismaService],
  exports: [UsuarioService],
})
export class UsuariosModule {}
