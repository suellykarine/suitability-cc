import { Module } from '@nestjs/common';
import { PreRegistroService } from './pre-registro.service';
import { PreRegistroController } from './pre-registro.controller';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import { PrismaStatusUsuarioRepositorio } from 'src/repositorios/prisma/prismaStatusUsuarioRepositrio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import { PrismaTipoUsuarioRepositorio } from 'src/repositorios/prisma/prismaTipoUsuarioRepositorio';
import { GestorFundoRepositorio } from 'src/repositorios/contratos/gestorFundoRepositorio';
import { PrismaGestorFundoRepositorio } from 'src/repositorios/prisma/prismaGestorFundoRepositorio';
import { CartaConviteRepositorio } from 'src/repositorios/contratos/cartaConviteRepositorio';
import { PrismaCartaConviteRepositorio } from 'src/repositorios/prisma/prismaCartaConviteRepositorio';
import { TokenUsadoRepositorio } from 'src/repositorios/contratos/tokenUsadoRepositorio';
import { PrismaTokenUsadoRepositorio } from 'src/repositorios/prisma/prismaTokenUsadoRepositoio';
import { StatusGestorFundoRepositorio } from 'src/repositorios/contratos/statusGestorFundoRepositorio';
import { PrismaStatusGestorFundoRepositorio } from 'src/repositorios/prisma/prismaStatusGestorFundoRepositorio';
import { CodigoVerificacaoRepositorio } from 'src/repositorios/contratos/codigoDeVerificacaoRepositorio';
import { PrismaCodigoVerificacaoRepositorio } from 'src/repositorios/prisma/prismaCodigoDeVerificacaoRepositorio';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { PrismaAdaptadorDb } from 'src/adaptadores/db/prismaAdaptadorDb';

@Module({
  controllers: [PreRegistroController],
  providers: [
    PreRegistroService,
    PrismaService,
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
    {
      provide: StatusUsuarioRepositorio,
      useClass: PrismaStatusUsuarioRepositorio,
    },
    {
      provide: TipoUsuarioRepositorio,
      useClass: PrismaTipoUsuarioRepositorio,
    },
    {
      provide: GestorFundoRepositorio,
      useClass: PrismaGestorFundoRepositorio,
    },
    {
      provide: CartaConviteRepositorio,
      useClass: PrismaCartaConviteRepositorio,
    },
    {
      provide: TokenUsadoRepositorio,
      useClass: PrismaTokenUsadoRepositorio,
    },
    {
      provide: StatusGestorFundoRepositorio,
      useClass: PrismaStatusGestorFundoRepositorio,
    },
    {
      provide: CodigoVerificacaoRepositorio,
      useClass: PrismaCodigoVerificacaoRepositorio,
    },
    {
      provide: AdaptadorDb,
      useClass: PrismaAdaptadorDb,
    },
  ],
})
export class PreRegistroModule {}
