import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtStrategyBackoffice } from './strategies/backoffice.strategy';
import { JwtStrategyAdm } from './strategies/adm.strategy';
import { JwtStrategyPremium } from './strategies/premium.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtStrategyBackoffice,
    JwtStrategyAdm,
    JwtStrategyPremium,
  ],
  exports: [AuthService],
})
export class AuthModule {}
