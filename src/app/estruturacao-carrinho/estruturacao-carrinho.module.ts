import { Module } from '@nestjs/common';
import { EstruturacaoCarrinhoService } from './estruturacao-carrinho.service';
import { EstruturacaoCarrinhoController } from './estruturacao-carrinho.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [EstruturacaoCarrinhoController],
  providers: [EstruturacaoCarrinhoService, ConfigService],
})
export class EstruturacaoCarrinhoModule {}
