import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { EstruturacaoCarrinhoService } from './estruturacao-carrinho.service';
import { CreateEstruturacaoCarrinhoDto } from './dto/create-estruturacao-carrinho.dto';
import { FormalizarCarteiraDto } from './dto/formalizar-carteira.dto';
import { ExcluirCarteiraDto } from './dto/excluir-carteira.dto';
import { IntroduzirAtivoCarteiraDto } from './dto/introduzir-ativo-carteira.dto';
import { JwtAuthGuard } from '../autenticacao/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('estruturaçao-carrinho')
@Controller('api/estruturacao-carrinho')
export class EstruturacaoCarrinhoController {
  constructor(
    private readonly estruturacaoCarrinhoService: EstruturacaoCarrinhoService,
  ) {}

  @Post()
  criarCarteira(
    @Body() createEstruturacaoCarrinhoDto: CreateEstruturacaoCarrinhoDto,
  ) {
    return this.estruturacaoCarrinhoService.criarCarteira(
      createEstruturacaoCarrinhoDto,
    );
  }

  @Post(':carteiraId/formalizar')
  formalizarCarteira(
    @Param('carteiraId') carteiraId: string,
    @Body() formalizarCarteiraDto: FormalizarCarteiraDto,
  ) {
    return this.estruturacaoCarrinhoService.formalizarCarteira(
      formalizarCarteiraDto,
      carteiraId,
    );
  }

  @Delete(':carteiraId')
  excluirCarteira(
    @Param('carteiraId') carteiraId: string,
    @Body() excluirCarteiraDto: ExcluirCarteiraDto,
  ) {
    return this.estruturacaoCarrinhoService.excluirCarteira(
      excluirCarteiraDto,
      carteiraId,
    );
  }

  @Post(':carteiraId/ativos')
  introduzirAtivoCarteira(
    @Param('carteiraId') carteiraId: string,
    @Body() introduzirAtivoCarteiraDto: IntroduzirAtivoCarteiraDto,
  ) {
    return this.estruturacaoCarrinhoService.introduzirAtivoCarteira(
      carteiraId,
      introduzirAtivoCarteiraDto,
    );
  }

  @Delete(':id/ativos/:ativoId')
  @HttpCode(204)
  removerAtivoCarteira(
    @Param('id') id: string,
    @Param('ativoId') ativoId: string,
  ) {
    return this.estruturacaoCarrinhoService.removerAtivoCarteira(id, ativoId);
  }
}
