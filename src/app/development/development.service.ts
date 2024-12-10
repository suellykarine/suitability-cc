import { Injectable } from '@nestjs/common';

import { CreditSecRemessaService } from '../credit-sec/credit-sec-remessa.service';

@Injectable()
export class DevelopmentService {
  constructor(private crediSecRemessaService: CreditSecRemessaService) {}

  async sandbox(args: any) {
    return this.crediSecRemessaService.buscarStatusRemessa(args);
  }
}
