import { Injectable } from '@nestjs/common';
import { fazerNada } from 'src/utils/funcoes/geral';

@Injectable()
export class DevelopmentService {
  constructor() {}

  async sandbox(args: any) {
    fazerNada(args);
    return; //this.creditSecRemessaService.buscarStatusRemessa(args);
  }
}
