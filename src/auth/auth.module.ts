import { Module } from '@nestjs/common';
import { ServiçoDeAutenticacao } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UsuariosModule } from '../usuarios/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtStrategyBackoffice } from './strategies/backoffice.strategy';
import { JwtStrategyAdm } from './strategies/adm.strategy';
import { JwtStrategyPremium } from './strategies/premium.strategy';
import { JwtStrategyPreRegister } from './strategies/pre-register.strategy';

@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    ServiçoDeAutenticacao,
    LocalStrategy,
    JwtStrategy,
    JwtStrategyBackoffice,
    JwtStrategyAdm,
    JwtStrategyPremium,
    JwtStrategyPreRegister,
  ],
  exports: [ServiçoDeAutenticacao],
})
export class AuthModule {}
