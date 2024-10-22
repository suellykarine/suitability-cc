import {
  HttpCode,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CedenteType } from 'src/@types/entities/cedente';
import { Endereco } from 'src/@types/entities/cedente';
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
import { BodyCallbackDto } from './dto/body-callback.dto';
import { SolicitarSerieType } from './interface/interface';

@Injectable()
export class CreditSecService {
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly fundoInvestimentoGestorFundoRepositorio: FundoInvestimentoGestorFundoRepositorio,
    private readonly usuarioFundoInvestimentoRepositorio: UsuarioFundoInvestimentoRepositorio,
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
  ) {}

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

      const serieInvestidor =
        cedenteCreditConnect.debenture_serie_investidor.find(
          (deb) =>
            deb.data_vinculo !== null &&
            deb.status_retorno_laqus.toLowerCase() == 'aprovado' &&
            deb.status_retorno_creditsec === null,
        );
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
  async registrarRetornoCreditSec(data: BodyCallbackDto) {
    try {
      const debentureSerie =
        await this.debentureSerieRepositorio.encontrarSeriesPorNumeroSerie(
          data.numero_serie,
        );
      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarPorIdDebentureSerie(
          debentureSerie.id,
        );

      const atualizaDebentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.atualizaDebentureSerieInvestidor(
          debentureSerieInvestidor.id,
          data.status,
          data.motivo,
        );

      return atualizaDebentureSerieInvestidor;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao registrar os dados',
      );
    }
  }
  private async solicitarSerieCreditSec(body: SolicitarSerieType) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC}/serie/solicitar_emissao`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CREDIT_SEC}`,
        },
      },
    );

    if (req.ok) return;
    throw new HttpException(
      `Erro ao criar serie: ${req.status} ${req.statusText}`,
      req.status,
    );
  }

  private async buscarCedenteSigma(
    identificador: string,
  ): Promise<CedenteType> {
    const req = await fetch(
      `${process.env.BASE_URL_CADASTRO_CEDENTE_SIGMA}/${identificador}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
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
    enderecoCedente: Endereco,
    cedenteCreditConnect: FundoInvestimento,
    usuario: Omit<Usuario, 'tipo_usuario'>,
    serieInvestidor: DebentureSerieInvestidor,
  ) {
    const objSolicitarSerie: SolicitarSerieType = {
      numero_emissao:
        serieInvestidor.debenture_serie.debenture.numero_debenture,
      numero_serie: serieInvestidor.debenture_serie.numero_serie,
      callback_url: `${process.env.BASE_URL}api/credit-sec/solicitar-serie/callback`,
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
      valor_total_integralizado: Number(
        serieInvestidor.debenture_serie.valor_serie,
      ),
    };
    return objSolicitarSerie;
  }
}
