import { Module } from '@nestjs/common';
import { PreRegistroService } from './pre-registro.service';
import { PreRegistroController } from './pre-registro.controller';

@Module({
  controllers: [PreRegistroController],
  providers: [PreRegistroService],
})
export class PreRegistroModule {}
