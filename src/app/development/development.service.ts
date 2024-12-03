import { Injectable } from '@nestjs/common';

import { DebentureSerieService } from '../debentures/debentures-serie.service';

@Injectable()
export class DevelopmentService {
  constructor(private debentureSerieService: DebentureSerieService) {}

  async sandbox(args: any) {
    return this.debentureSerieService.solicitarSerie({
      identificadorFundo: args.identificadorFundo,
      valorEntrada: args.valorEntrada,
    });
  }
}
