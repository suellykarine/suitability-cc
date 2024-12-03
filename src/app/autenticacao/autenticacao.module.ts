import { Module } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UsuariosModule } from '../usuarios/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtStrategyBackoffice } from './strategies/backoffice.strategy';
import { JwtStrategyAdm } from './strategies/adm.strategy';
import { JwtStrategyPremium } from './strategies/premium.strategy';
import { JwtStrategyPreRegister } from './strategies/pre-register.strategy';
import { JwtStrategyCartaConvite } from './strategies/carta-convite.strategy';
import { PrismaService } from 'prisma/prisma.service';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';
import { AutenticacaoController } from './autenticacao.controller';
import { JwtStrategyDevelopment } from './strategies/development.strategy';

@Module({
  controllers: [AutenticacaoController],
  imports: [UsuariosModule, PassportModule, JwtModule.register({})],
  providers: [
    AutenticacaoService,
    LocalStrategy,
    JwtStrategy,
    JwtStrategyBackoffice,
    JwtStrategyAdm,
    JwtStrategyPremium,
    JwtStrategyPreRegister,
    JwtStrategyCartaConvite,
    JwtStrategyDevelopment,
    PrismaService,
    {
      provide: UsuarioRepositorio,
      useClass: PrismaUsuarioRepositorio,
    },
  ],
  exports: [AutenticacaoService],
})
export class AuthModule {}
