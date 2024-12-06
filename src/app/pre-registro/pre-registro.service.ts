import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
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
    const usuarioRequisicao =
      await this.usuarioRepositorio.encontrarPorId(idUsuarioRequisicao);

    if (!usuarioRequisicao) {
      throw new NotFoundException('Usuário requisitante não encontrado');
    }

    const usuario = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new UnauthorizedException(donoAdminOuBackoffice);
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
    const usuario = await this.usuarioRepositorio.encontrarPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const usuarioRequisicao =
      await this.usuarioRepositorio.encontrarPorId(idUsuarioRequisicao);

    const donoAdminOuBackoffice = this.donoAdminOuBackoffice(
      usuario,
      usuarioRequisicao,
    );
    if (donoAdminOuBackoffice) {
      throw new UnauthorizedException(donoAdminOuBackoffice);
    }

    const statusDesativado =
      await this.statusUsuarioRepositorio.encontrarPorNome(
        StatusUsuario.DESATIVADO,
      );
    if (!statusDesativado) {
      throw new NotFoundException('Status de usuário não encontrado');
    }
    const usuarioDesativado =
      usuario.id_status_usuario === statusDesativado.id ? true : false;
    if (usuarioDesativado) {
      throw new BadRequestException('Usuário já está inativo');
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
        throw new NotFoundException({
          mensagem: 'Carta convite não encontrada ou não aprovada',
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
    const cartaConvite =
      await this.cartaConviteRepositorio.encontrarPorIdEAprovado(
        invitationLetter.id,
      );

    if (!cartaConvite) {
      throw new NotFoundException('Carta convite não encontrada');
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
    } catch (error) {
      throw new ServiceUnavailableException({
        mensagem: 'Serviço de e-mail indisponível.',
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
