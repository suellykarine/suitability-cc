import { Body, Controller, Post } from '@nestjs/common';
import { BuscarArquivoService } from './buscar-arquivo.service';
import { BuscarConteudoArquivoDto } from './dto/buscar-arquivo.dto';

@Controller('api/buscar-arquivo')
export class BuscarArquivoController {
  constructor(private readonly buscarArquivoService: BuscarArquivoService) {}

  @Post()
  async buscarConteudoArquivo(@Body() dto: BuscarConteudoArquivoDto) {
    return this.buscarArquivoService.buscarConteudoArquivo(dto);
  }
}
