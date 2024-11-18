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

import { sigmaHeaders } from 'src/app/auth/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { BodyRetornoCriacaoSerieDto } from './dto/body-callback.dto';
import { SolicitarSerieType } from './interface/interface';
import { Cron } from '@nestjs/schedule';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { ConfigService } from '@nestjs/config';

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
    private readonly debentureRepositorio: DebentureRepositorio,
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

  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoSerie() {
    try {
      const debentureSerieInvestidorPendentes =
        await this.debentureSerieInvestidorRepositorio.todosStatusCreditSecNull();

      const todasSeriesAtualizadas = await Promise.all(
        debentureSerieInvestidorPendentes.map(async (ele) => {
          const debentureSerie =
            await this.debentureSerieRepositorio.encontrarPorId(
              ele.id_debenture_serie,
            );
          const debenture = await this.debentureRepositorio.encontrarPorId(
            debentureSerie.id_debenture,
          );

          const numero_emissao = debenture.numero_debenture;
          const numero_serie = debentureSerie.numero_serie;

          const statusCreditSec = await this.buscarStatusSerieCreditSec(
            numero_emissao,
            numero_serie,
          );

          if (statusCreditSec.status === 'PENDING') return;

          const retornoCreditSec =
            await this.registrarRetornoCreditSec(statusCreditSec);
          return retornoCreditSec;
        }),
      );
      return todasSeriesAtualizadas;
    } catch (error) {
      throw error;
    }
  }

  async solicitarSerie(id_cedente: number) {
    try {
      const usuario = await this.buscarUsuario(id_cedente);
      const cedenteCreditConnect =
        await this.buscarCedenteCreditConnect(id_cedente);
      const cedenteSigma = await this.buscarCedenteSigma(
        cedenteCreditConnect.cpf_cnpj,
      );
      const enderecoCedente = cedenteSigma.endereco;
      const representanteCedente = cedenteCreditConnect.representante_fundo;

      const debentureSerieInvestidorIsArray = Array.isArray(
        cedenteCreditConnect.debenture_serie_investidor,
      );
      const debentureSerieInvestidor = debentureSerieInvestidorIsArray
        ? cedenteCreditConnect.debenture_serie_investidor
        : Object.values(cedenteCreditConnect.debenture_serie_investidor);

      const serieInvestidor = debentureSerieInvestidor.find((deb) => {
        if (!deb.data_vinculo) return false;
        if (deb.status_retorno_creditsec) return false;
        const isApproved = deb.status_retorno_laqus.toLowerCase() == 'aprovado';
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
        cedenteCreditConnect,
        usuario,
        serieInvestidor,
      );

      await this.solicitarSerieCreditSec(bodySolicitarSerie);

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
      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarPorIdDebentureSerie(
          debentureSerie.id,
        );

      const dataDesvinculo = data.status === 'FAILURE' ? new Date() : null;
      const atualizaDebentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.atualizaDebentureSerieInvestidor(
          {
            data_desvinculo: dataDesvinculo,
            id_debenture_serie_investidor: debentureSerieInvestidor.id,
            motivo: data.motivo,
            status: data.status,
          },
        );

      if (data.status === 'SUCCESS')
        await this.registrarDataEmissaoSerie(debentureSerie.id);

      if (data.status === 'FAILURE')
        await this.desabilitarDebentureFundoInvestimento(
          debentureSerieInvestidor.id_fundo_investimento,
        );

      return atualizaDebentureSerieInvestidor;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao registrar os dados',
      );
    }
  }

  private async registrarDataEmissaoSerie(id_debenture_serie: number) {
    const dataAtual = new Date();
    const dataFutura = new Date();
    dataFutura.setMonth(dataFutura.getMonth() + 6);

    const atualizaDebentureSerie =
      await this.debentureSerieRepositorio.atualizaDatasDebentureSerie({
        data_emissao: dataAtual,
        data_vencimento: dataFutura,
        id_debenture_serie,
      });
    return atualizaDebentureSerie;
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

    if (req.ok) return;
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

  private async buscarCedenteCreditConnect(id: number) {
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
