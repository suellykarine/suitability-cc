import { Module } from '@nestjs/common';
import { CartaConviteService } from './carta-convite.service';
import { CartaConviteController } from './carta-convite.controller';

@Module({
  controllers: [CartaConviteController],
  providers: [CartaConviteService],
})
export class CartaConviteModule {}
