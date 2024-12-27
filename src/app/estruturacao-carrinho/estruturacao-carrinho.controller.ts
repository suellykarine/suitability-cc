import {
  Controller,
  Post,
  Body,
  Param,
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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ErrorResponseDto,
  EstruturarInvestimentoDiretoResponseDto,
} from './dto/estruturar-investimento-direto.dto';
import { ErroRequisicaoInvalida } from 'src/helpers/erroAplicacao';

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

  @Post('direto/:identificador/:codigoOperacao')
  @ApiResponse({
    status: 200,
    description: 'Compra formalizada com sucesso',
    type: EstruturarInvestimentoDiretoResponseDto,
  })
  @ApiResponse({
    status: 400,
    type: ErrorResponseDto,
    description: `
      Erros possíveis durante o processo:
      - Não encontramos nenhuma conta ativa para o cedente.
      - Não foi possível registrar  o Controle de Cadastro da Conta do Cedente para Operações Financeiras.
      - Não foi possível iniciar a formalização da operação.
      - Não foi possivel deletar o controle de operação.
    `,
  })
  estruturacaoDireta(
    @Param('identificador') identificador: string,
    @Param('codigoOperacao') codigoOperacao: string,
  ): Promise<EstruturarInvestimentoDiretoResponseDto> {
    const codigoDaOperacaoNumber = Number(codigoOperacao);

    if (!codigoDaOperacaoNumber) {
      throw new ErroRequisicaoInvalida({
        acao: 'controler.estruturacaoCarrinho.direto/identificador/codigoOperacao',
        mensagem: 'formato do codigo da operacao inválido',
        detalhes: {
          codigoOperacao,
          identificador,
        },
      });
    }

    return this.estruturacaoCarrinhoService.estruturarInvestimentoDireto({
      identificador,
      codigoOperacao: codigoDaOperacaoNumber,
    });
  }
}
