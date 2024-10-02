import { Module } from '@nestjs/common';
import { LaqusController } from './laqus.controller';
import { AutenticarLaqusService } from './services/autenticarLaqus.service';
import { CriarInvestidorLaqusService } from './services/criarInvestidorLaqus.service';
import { buscarStatusInvestidorLaqusService } from './services/buscarStatusInvestidorLaqus.service';

@Module({
  controllers: [LaqusController],
  providers: [
    AutenticarLaqusService,
    CriarInvestidorLaqusService,
    buscarStatusInvestidorLaqusService,
  ],
  exports: [
    AutenticarLaqusService,
    CriarInvestidorLaqusService,
    buscarStatusInvestidorLaqusService,
  ],
})
export class LaqusModule {}
