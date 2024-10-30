import { Module } from '@nestjs/common';
import { AdmService } from './adm.service';
import { AdmController } from './adm.controller';
import { PrismaService } from 'prisma/prisma.service';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import { PrismaStatusUsuarioRepositorio } from 'src/repositorios/prisma/prismaStatusUsuarioRepositrio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import { PrismaTipoUsuarioRepositorio } from 'src/repositorios/prisma/prismaTipoUsuarioRepositorio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';

@Module({
  controllers: [AdmController],
  providers: [
    AdmService,
    PrismaService,
    {
      provide: StatusUsuarioRepositorio,
      useClass: PrismaStatusUsuarioRepositorio,
    },
    {
      provide: TipoUsuarioRepositorio,
      useClass: PrismaTipoUsuarioRepositorio,
    },
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
  ],
})
export class AdmModule {}
