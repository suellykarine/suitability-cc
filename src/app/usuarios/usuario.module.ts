import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { PrismaService } from 'prisma/prisma.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuarioService,
    PrismaService,
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
  ],
  exports: [UsuarioService],
})
export class UsuariosModule {}
