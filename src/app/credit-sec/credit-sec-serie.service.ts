import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { Cedente } from 'src/@types/entities/cedente';
import { EnderecoCedente } from 'src/@types/entities/cedente';
import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
import {
  FundoInvestimento,
  RepresentanteFundo,
} from 'src/@types/entities/fundos';
import { Usuario } from 'src/@types/entities/usuario';

import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { BodyRetornoCriacaoSerieDto } from './dto/body-callback.dto';
import { SolicitarSerieType } from './interface/interface';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { statusRetornoCreditSecDicionario } from './const';

@Injectable()
export class CreditSecSerieService {
  private baseUrl: string;
  private tokenCreditSecSolicitarSerie: string;
  private baseUrlCreditSecSolicitarSerie: string;
  private baseUrlCadastroSigma: string;
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly fundoInvestimentoGestorFundoRepositorio: FundoInvestimentoGestorFundoRepositorio,
    private readonly usuarioFundoInvestimentoRepositorio: UsuarioFundoInvestimentoRepositorio,
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('BASE_URL');
    this.tokenCreditSecSolicitarSerie = this.configService.get(
      'TOKEN_CREDIT_SEC_SOLICITAR_SERIE',
    );
    this.baseUrlCreditSecSolicitarSerie = this.configService.get(
      'BASE_URL_CREDIT_SEC_SOLICITAR_SERIE',
    );
    this.baseUrlCadastroSigma = this.configService.get(
      'BASE_URL_CADASTRO_CEDENTE_SIGMA',
    );
  }

  private async atualizarStatusCreditSec({
    numeroDebenture,
    numeroSerie,
  }: {
    numeroDebenture: number;
    numeroSerie: number;
  }) {
    const statusCreditSec = await this.buscarStatusSerieCreditSec(
      numeroDebenture,
      numeroSerie,
    );

    if (statusCreditSec.status === 'PENDING') return;

    return this.registrarRetornoCreditSec(statusCreditSec);
  }

  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoSerie() {
    try {
      const debentureSerieInvestidorPendentes =
        await this.debentureSerieInvestidorRepositorio.todosStatusCreditSecNull();

      const todasSeriesAtualizadas = await Promise.all(
        debentureSerieInvestidorPendentes.map(
          async ({ debenture_serie: debentureSerie }) => {
            const numeroDebenture = debentureSerie.debenture.numero_debenture;
            const numeroSerie = debentureSerie.numero_serie;

            return this.atualizarStatusCreditSec({
              numeroDebenture,
              numeroSerie,
            });
          },
        ),
      );
      return todasSeriesAtualizadas;
    } catch (error) {
      throw error;
    }
  }

  async solicitarSerie(id_cedente: number) {
    try {
      const usuario = await this.buscarUsuario(id_cedente);
      const fundoInvestidor = await this.buscarFundoInvestidor(id_cedente);
      const cedenteSigma = await this.buscarCedenteSigma(
        fundoInvestidor.cpf_cnpj,
      );
      const enderecoCedente = cedenteSigma.endereco;
      const representanteCedente = fundoInvestidor.representante_fundo;

      const debentureSerieInvestidor =
        fundoInvestidor.debenture_serie_investidor;
      const serieInvestidor = debentureSerieInvestidor.find((dsi) => {
        if (!dsi.data_vinculo) return false;
        if (dsi.status_retorno_creditsec) return false;
        const isApproved = dsi.status_retorno_laqus === 'APROVADO';
        if (!isApproved) return false;
        return true;
      });
      if (!serieInvestidor)
        throw new NotAcceptableException(
          'Não foi possível identificar a série do investidor',
        );
      const bodySolicitarSerie = await this.montarBodySolicitarSerie(
        representanteCedente,
        enderecoCedente,
        fundoInvestidor,
        usuario,
        serieInvestidor,
      );
      const ultimoVinculoDSI =
        await this.debentureSerieInvestidorRepositorio.encontraMaisRecentePorIdFundoInvestimento(
          { id_fundo_investimento: fundoInvestidor.id },
        );

      if (!ultimoVinculoDSI) {
        throw new InternalServerErrorException(
          'Erro ao encontrar debenture serie investidor',
        );
      }

      try {
        await this.solicitarSerieCreditSec(bodySolicitarSerie);
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: ultimoVinculoDSI.id,
          status_retorno_creditsec: 'PENDENTE',
          mensagem_retorno_creditsec: null,
        });
      } catch (error) {
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: ultimoVinculoDSI.id,
          status_retorno_creditsec: 'ERRO',
          mensagem_retorno_creditsec: 'Falha ao cadastrar série no CreditSec',
        });
        throw error;
      }

      return;
    } catch (error) {
      throw error;
    }
  }
  async registrarRetornoCreditSec(data: BodyRetornoCriacaoSerieDto) {
    try {
      const debentureSerie =
        await this.debentureSerieRepositorio.encontrarSeriePorNumeroSerie(
          +data.numero_serie,
        );
      const ultimoVinculoDSI =
        await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdDebentureSerie(
          debentureSerie.id,
        );

      const status = statusRetornoCreditSecDicionario[data.status] ?? 'ERRO';

      const dataDesvinculo = status === 'REPROVADO' ? new Date() : null;
      const ehStatusErro = status === 'ERRO';
      const debentureSerieInvestidorAtualizado =
        await this.debentureSerieInvestidorRepositorio.atualizar({
          data_desvinculo: dataDesvinculo,
          id: ultimoVinculoDSI.id,
          mensagem_retorno_creditsec:
            data.motivo ??
            (ehStatusErro ? 'Erro não informado ao salvar retorno' : null),
          status_retorno_creditsec: status,
        });

      if (status === 'APROVADO')
        await this.registrarDataEmissaoSerie(debentureSerie.id);

      if (status === 'REPROVADO')
        await this.desabilitarDebentureFundoInvestimento(
          ultimoVinculoDSI.id_fundo_investimento,
        );

      return debentureSerieInvestidorAtualizado;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao registrar os dados',
      );
    }
  }

  private async registrarDataEmissaoSerie(id_debenture_serie: number) {
    const dataAtual = new Date();
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataAtual.getMonth() + 6);

    const debentureSerieAtualizado =
      await this.debentureSerieRepositorio.atualizaDatasDebentureSerie({
        data_emissao: dataAtual,
        data_vencimento: dataVencimento,
        id_debenture_serie,
      });
    return debentureSerieAtualizado;
  }

  private async desabilitarDebentureFundoInvestimento(id_fundo: number) {
    const desabilitaDebenture =
      await this.fundoInvestimentoRepositorio.atualizaAptoDebentureEvalorSerie({
        apto_debenture: false,
        id_fundo: id_fundo,
        valor_serie_debenture: null,
      });
    return desabilitaDebenture;
  }

  private async buscarStatusSerieCreditSec(
    numero_emissao: number,
    numero_serie: number,
  ): Promise<BodyRetornoCriacaoSerieDto> {
    const req = await fetch(
      `${this.baseUrlCreditSecSolicitarSerie}/serie/solicitar_emissao?numero_emissao=${numero_emissao}&numero_serie=${numero_serie}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.tokenCreditSecSolicitarSerie}`,
        },
      },
    );

    if (req.ok) return await req.json();
    throw new HttpException(
      `Erro ao buscar serie: ${req.status} ${req.statusText}`,
      req.status,
    );
  }
  private async solicitarSerieCreditSec(body: SolicitarSerieType) {
    console.log('body #solicitarSerieCreditSec');
    console.log(body);
    const req = await fetch(
      `${this.baseUrlCreditSecSolicitarSerie}/serie/solicitar_emissao`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.tokenCreditSecSolicitarSerie}`,
        },
      },
    );
    const creditSecData = await req.json();
    if (req.ok) return;
    console.log('erro #solicitarSerieCreditSec');
    console.log(creditSecData);
    throw new HttpException(
      `Erro ao criar serie: ${req.status} ${req.statusText}`,
      req.status,
    );
  }

  private async buscarCedenteSigma(identificador: string): Promise<Cedente> {
    const req = await fetch(`${this.baseUrlCadastroSigma}/${identificador}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
    });
    const response = await req.json();

    if (req.ok) return response;

    throw new HttpException(
      `Erro ao buscar cedente no sigma: ${req.status} ${req.statusText}`,
      req.status,
    );
  }

  private async buscarFundoInvestidor(id: number) {
    const fund =
      await this.fundoInvestimentoRepositorio.encontrarComRelacionamentos(id);

    if (fund.cpf_cnpj) return fund;
    throw new InternalServerErrorException('Erro ao buscar cedente');
  }

  private async buscarUsuario(idFundo: number) {
    const fundoGestorFundo =
      await this.fundoInvestimentoGestorFundoRepositorio.encontrarPorIdDoFundo(
        idFundo,
      );

    const usuarioFundo =
      await this.usuarioFundoInvestimentoRepositorio.encontrarPeloIdGestorFundo(
        fundoGestorFundo.id,
      );
    const usuario = await this.usuarioRepositorio.encontrarPorId(
      usuarioFundo.id_usuario,
    );

    if (usuario.cpf) return usuario;

    throw new InternalServerErrorException('Erro ao buscar usuário');
  }

  private async montarBodySolicitarSerie(
    representanteCedente: RepresentanteFundo,
    enderecoCedente: EnderecoCedente,
    cedenteCreditConnect: FundoInvestimento,
    usuario: Omit<Usuario, 'tipo_usuario'>,
    serieInvestidor: DebentureSerieInvestidor,
  ) {
    const objSolicitarSerie: SolicitarSerieType = {
      numero_emissao:
        serieInvestidor.debenture_serie.debenture.numero_debenture,
      numero_serie: serieInvestidor.debenture_serie.numero_serie,
      callback_url: `${this.baseUrl}api/credit-sec/solicitar-serie/retorno/criacao-serie`,
      conta_serie: {
        banco: '533',
        agencia: serieInvestidor.conta_investidor.agencia,
        conta: serieInvestidor.conta_investidor.conta,
        digito: serieInvestidor.conta_investidor.conta_digito,
      },
      debenturista: {
        cnpj: cedenteCreditConnect.cpf_cnpj,
        razao_social: cedenteCreditConnect.razao_social,
        nome_fantasia: cedenteCreditConnect.nome_fantasia,
        endereco: {
          cep: enderecoCedente.cep,
          uf: enderecoCedente.uf,
          cidade: enderecoCedente.cidade,
          bairro: enderecoCedente.bairro,
          logradouro: enderecoCedente.logradouro,
          complemento: enderecoCedente.complemento,
          numero: enderecoCedente.numero,
        },
        contato: {
          email: usuario.email,
          telefone: usuario.telefone,
          nome: usuario.nome,
        },
      },
      representantes: [
        {
          cpf: representanteCedente.cpf,
          email: representanteCedente.email,
          nome: representanteCedente.nome,
          telefone: representanteCedente.telefone,
        },
      ],
      valor_total_integralizado: +serieInvestidor.debenture_serie.valor_serie,
    };
    return objSolicitarSerie;
  }
}
