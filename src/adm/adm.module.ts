import { Module } from '@nestjs/common';
import { AdmService } from './adm.service';
import { AdmController } from './adm.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AdmController],
  providers: [AdmService, PrismaService],
})
export class AdmModule {}
