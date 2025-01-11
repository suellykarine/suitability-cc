import { forwardRef, Module } from '@nestjs/common';
import { CreditSecRemessaModule } from './modules/credit-sec-remessa/credit-sec-remessa.module';
import { CreditSecSerieModule } from './modules/credit-sec-serie/credit-sec-serie.module';

@Module({
  imports: [
    forwardRef(() => CreditSecRemessaModule),
    forwardRef(() => CreditSecSerieModule),
  ],
  controllers: [],
  providers: [],
  exports: [CreditSecRemessaModule, CreditSecSerieModule],
})
export class CreditSecModule {}
