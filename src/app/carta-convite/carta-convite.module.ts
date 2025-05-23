import { Module } from '@nestjs/common';
import { CartaConviteService } from './carta-convite.service';
import { CartaConviteController } from './carta-convite.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [CartaConviteController],
  providers: [CartaConviteService, PrismaService],
})
export class CartaConviteModule {}
