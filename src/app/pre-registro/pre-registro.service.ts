import { Injectable } from '@nestjs/common';
import {
  formatarCPF,
  formatarCNPJ,
  formatarTelefone,
} from 'src/utils/formatar';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import { StatusGestorFundo } from 'src/enums/StatusGestorFundo';
import {
  CriarCodigoDeVerificacaoDto,
  CriarUsuarioDto,
} from './dto/criar-pre-registro.dto';
import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';
import { servicoEmailSrm } from 'src/utils/servico-email-srm/servico';
import { SolicitacaoBase } from 'src/utils/interfaces/solicitacaoBase.interface';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { StatusUsuarioRepositorio } from 'src/repositorios/contratos/statusUsuarioRepositorio';
import { GestorFundoRepositorio } from 'src/repositorios/contratos/gestorFundoRepositorio';
import { CartaConviteRepositorio } from 'src/repositorios/contratos/cartaConviteRepositorio';
import { StatusGestorFundoRepositorio } from 'src/repositorios/contratos/statusGestorFundoRepositorio';
import { TokenUsadoRepositorio } from 'src/repositorios/contratos/tokenUsadoRepositorio';
import { TipoUsuarioRepositorio } from 'src/repositorios/contratos/tipoUsuarioRepositorio';
import { CodigoVerificacaoRepositorio } from 'src/repositorios/contratos/codigoDeVerificacaoRepositorio';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { Usuario } from 'src/@types/entities/usuario';
import {
  ErroAplicacao,
  ErroNaoAutorizado,
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class PreRegistroService {
  constructor(
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly statusUsuarioRepositorio: StatusUsuarioRepositorio,
    private readonly gestorFundoRepositorio: GestorFundoRepositorio,
    private readonly tipoUsuarioRepositorio: TipoUsuarioRepositorio,
    private readonly cartaConviteRepositorio: CartaConviteRepositorio,
    private readonly statusGestorFundoRepositorio: StatusGestorFundoRepositorio,
    private readonly tokenUsadoRepositorio: TokenUsadoRepositorio,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly codigoVerificacaoRepositorio: CodigoVerificacaoRepositorio,
  ) {}

  async encontrarTodosUsuarios() {
    const usuarios = await this.usuarioRepositorio.encontrarTodos();
    return {
      mensagem: 'sucesso',
      usuarios: usuarios.map((usuario: any) => {
        return {
          ...usuario,
          cpf: formatarCPF(usuario.cpf),
          telefone: formatarTelefone(usuario.telefone),
          gestor_fundo: usuario.gestor_fundo
            ? {
                ...usuario.gestor_fundo,
                cnpj: formatarCNPJ(usuario.gestor_fundo.cnpj),
              }
            : undefined,
        };
      }),
    };
  }
  async encontrarUmUsuario(id: number, idUsuarioRequisicao: number) {
    const logAcao = 'encontrarTodosUsuarios.encontrarUmUsuario';
    const usuarioRequisicao =
      await this.usuarioRepositorio.encontrarPorId(idUsuarioRequisicao);

    if (!usuarioRequisicao) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Usuário requisitante não encontrado',
        detalhes: {
          id,
          idUsuarioRequisicao,
        },
      });
    }

    const usuario = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuario) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Usuário não encontrado',
        detalhes: {
          id,
          idUsuarioRequisicao,
        },
      });
    }

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new ErroNaoAutorizado({
        acao: logAcao,
        mensagem: donoAdminOuBackoffice.mensagem,
        detalhes: {
          donoAdminOuBackoffice,
          id,
          idUsuarioRequisicao,
        },
      });
    }

    return {
      mensagem: 'sucesso',
      usuario: {
        ...usuario,
        cpf: formatarCPF(usuario.cpf!),
        telefone: formatarTelefone(usuario.telefone!),
      },
    };
  }

  async removerUsuario(id: number, idUsuarioRequisicao: number) {
    const logAcao = 'PreRegistroService.removerUsuario';
    const usuario = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuario) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Usuário não encontrado',
        detalhes: {
          id,
          idUsuarioRequisicao,
        },
      });
    }

    const usuarioRequisicao =
      await this.usuarioRepositorio.encontrarPorId(idUsuarioRequisicao);

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: donoAdminOuBackoffice.mensagem,
        detalhes: {
          donoAdminOuBackoffice,
          id,
          idUsuarioRequisicao,
        },
      });
    }

    const statusDesativado =
      await this.statusUsuarioRepositorio.encontrarPorNome(
        StatusUsuario.DESATIVADO,
      );
    if (!statusDesativado) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Status de usuário não encontrado',
        detalhes: {
          id,
          idUsuarioRequisicao,
        },
      });
    }
    const usuarioDesativado =
      usuario.id_status_usuario === statusDesativado.id ? true : false;
    if (usuarioDesativado) {
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Usuário já está inativo',
        detalhes: {
          id,
          idUsuarioRequisicao,
        },
      });
    }
    await this.usuarioRepositorio.atualizar(id, {
      id_status_usuario: statusDesativado.id,
    });
  }
  async criarUsuario(
    criarUsuarioDto: CriarUsuarioDto,
    cartaConvite: any,
    token: string,
  ): Promise<any> {
    const logAcao = 'PreRegistroService.criarUsuario';
    const tipoUsuario = await this.tipoUsuarioRepositorio.encontrarPorTipo(
      TipoUsuarioEnum.INVESTIDOR_TRIAL,
    );
    const statusUsuario = await this.statusUsuarioRepositorio.encontrarPorNome(
      StatusUsuario.PRIMEIRO_ACESSO,
    );
    const statusGestor =
      await this.statusGestorFundoRepositorio.encontrarPorNome(
        StatusGestorFundo.APROVADO,
      );

    const senhaEmHash = await bcrypt.hash(criarUsuarioDto.senha, 10);

    const usuarioSalvo = await this.adaptadorDb.fazerTransacao(async () => {
      const encontrarCartaConvite =
        await this.cartaConviteRepositorio.encontrarPorIdEAprovado(
          cartaConvite.id,
        );
      if (!encontrarCartaConvite) {
        throw new ErroNaoEncontrado({
          acao: logAcao,
          mensagem: 'Carta convite não encontrada ou não aprovada',
          detalhes: {
            criarUsuarioDto,
            token,
            cartaConvite,
          },
        });
      }

      const gestorSalvo = await this.buscarOuCriarGestor(
        encontrarCartaConvite.cnpj,
        encontrarCartaConvite.empresa,
        statusGestor.id,
      );

      const usuarioSalvo = await this.usuarioRepositorio.criar({
        nome: encontrarCartaConvite.nome,
        cpf: encontrarCartaConvite.cpf,
        telefone: encontrarCartaConvite.telefone,
        email: encontrarCartaConvite.email,
        senha: senhaEmHash,
        id_status_usuario: statusUsuario.id,
        id_tipo_usuario: tipoUsuario.id,
        id_gestor_fundo: gestorSalvo.id,
      });

      await this.tokenUsadoRepositorio.criar(
        token,
        new Date(Number(cartaConvite.iat) * 1000),
      );

      return usuarioSalvo;
    }, [
      this.gestorFundoRepositorio,
      this.usuarioRepositorio,
      this.tokenUsadoRepositorio,
    ]);

    return {
      mensagem: 'Criado',
      usuario: usuarioSalvo,
    };
  }

  async encontrarCartaConvite(invitationLetter: any): Promise<any> {
    const logAcao = 'PreRegistroService.encontrarCartaConvite';
    const cartaConvite =
      await this.cartaConviteRepositorio.encontrarPorIdEAprovado(
        invitationLetter.id,
      );

    if (!cartaConvite) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Carta convite não encontrada',
        detalhes: { invitationLetter },
      });
    }

    return {
      carta_convite: cartaConvite,
    };
  }

  async enviarCodigoDeVerificacao(
    criarCodigoDeVerificacaoDto: CriarCodigoDeVerificacaoDto,
  ) {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      6,
    );
    const codigo = nanoid();

    const requestBase: SolicitacaoBase = {
      contentParam: {
        nome: 'Investidor',
        codigo: codigo,
      },
      mail: {
        addressesCcTo: [],
        addressesTo: <string[]>[criarCodigoDeVerificacaoDto.email],
        emailFrom: 'srmasset@srmasset.com.br',
        subject: 'Código de verificação',
      },
      templateName:
        'credit_connect_usuario_trial_codigo_de_verificacao_de_email.html',
    };
    try {
      await servicoEmailSrm(requestBase);
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroServidorInterno({
        acao: 'PreRegistroService.enviarCodigoDeVerificacao',
        mensagem: 'Serviço de e-mail indisponível.',
        detalhes: {
          erro,
        },
      });
    }

    const codigoDeVerificacaoExistente =
      await this.codigoVerificacaoRepositorio.encontrarPorEmail(
        criarCodigoDeVerificacaoDto.email,
      );

    if (codigoDeVerificacaoExistente) {
      await this.codigoVerificacaoRepositorio.atualizar(
        codigoDeVerificacaoExistente.id,
        codigo,
      );
    } else {
      const dataExpiracao = new Date();
      dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);
      await this.codigoVerificacaoRepositorio.criar(
        criarCodigoDeVerificacaoDto.email,
        codigo,
        dataExpiracao,
      );
    }

    return { mensagem: 'Código de verificação enviado com sucesso.' };
  }
  private donoAdminOuBackoffice(usuario: Usuario, tokenUsuario: any) {
    if (
      usuario.id !== tokenUsuario.id &&
      tokenUsuario.tipo_usuario.tipo !== TipoUsuarioEnum.BACKOFFICE &&
      tokenUsuario.tipo_usuario.tipo !== TipoUsuarioEnum.ADMINISTRADOR_SISTEMAS
    ) {
      return {
        mensagem: 'Não autorizado',
      };
    }
  }

  private async buscarOuCriarGestor(
    cnpj: string,
    nomeFantasia: string,
    statusGestorId: number,
  ) {
    const gestorSalvo =
      await this.gestorFundoRepositorio.encontrarPorCnpj(cnpj);

    return gestorSalvo
      ? gestorSalvo
      : await this.gestorFundoRepositorio.criar({
          cnpj,
          nome_fantasia: nomeFantasia,
          status_gestor_fundo: {
            connect: { id: statusGestorId },
          },
        });
  }
}
