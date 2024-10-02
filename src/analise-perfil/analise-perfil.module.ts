import { Module } from '@nestjs/common';
import { AnalisePerfilService } from './analise-perfil.service';
import { AnalisePerfilController } from './analise-perfil.controller';
import { FundosService } from 'src/fundos/fundos.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [AnalisePerfilController],
  providers: [AnalisePerfilService, FundosService, PrismaService],
})
export class AnalisePerfilModule {}
