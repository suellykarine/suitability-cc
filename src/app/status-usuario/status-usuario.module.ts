import { Module } from '@nestjs/common';
import { StatusUsuarioService } from './status-usuario.service';
import { StatusUsuarioController } from './status-usuario.controller';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import { PrismaTipoUsuarioRepositorio } from 'src/repositorios/prisma/prismaTipoUsuarioRepositorio';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import { PrismaStatusUsuarioRepositorio } from 'src/repositorios/prisma/prismaStatusUsuarioRepositrio';

@Module({
  controllers: [StatusUsuarioController],
  providers: [
    StatusUsuarioService,
    PrismaService,
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
    {
      provide: TipoUsuarioRepositorio,
      useClass: PrismaTipoUsuarioRepositorio,
    },
    {
      provide: StatusUsuarioRepositorio,
      useClass: PrismaStatusUsuarioRepositorio,
    },
  ],
})
export class StatusUsuarioModule {}
