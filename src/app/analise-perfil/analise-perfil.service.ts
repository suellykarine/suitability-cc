import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StatusDocumento } from 'src/enums/StatusDocumento';
import { StatusUsuario } from 'src/enums/StatusUsuario';
import { formatarCPF, formatarTelefone } from 'src/utils/formatar';
import { FundosService } from '../fundos/fundos.service';
import { usuario } from '@prisma/client';
import { fazerNada } from 'src/utils/funcoes/geral';

@Injectable()
export class AnalisePerfilService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fundosService: FundosService,
  ) {}

  async obterUsuarios() {
    const usuariosAguardandoAnalise = await this.obterUsuariosPorStatus([
      StatusUsuario.AGUARDANDO_ANALISE,
    ]);

    const usuariosAprovados = await this.obterUsuariosPorStatus([
      StatusUsuario.APROVADO,
      StatusUsuario.PRIMEIRO_ACESSO_PREMIUM,
    ]);

    const usuariosRecusados = await this.obterUsuariosPorStatus([
      StatusUsuario.RECUSADO,
    ]);

    const usuariosEmAnalise = await this.obterUsuariosPorStatus([
      StatusUsuario.EM_ANALISE,
    ]);

    const usuariosAguardandoAnaliseProcessados = await this.processarUsuarios(
      usuariosAguardandoAnalise,
    );

    const usuariosAprovadosProcessados =
      await this.processarUsuarios(usuariosAprovados);

    const usuariosEmAnaliseProcessados =
      await this.processarUsuarios(usuariosEmAnalise);

    const usuariosRecusadosSemSenha = usuariosRecusados.map((user) =>
      this.usuarioSemSenha(user),
    );

    return {
      usuarios_aguardando_analise: usuariosAguardandoAnaliseProcessados,
      usuarios_em_analise: usuariosEmAnaliseProcessados,
      usuarios_aprovados: usuariosAprovadosProcessados,
      usuarios_recusados: usuariosRecusadosSemSenha,
    };
  }

  private async obterUsuariosPorStatus(statusList: string[]) {
    return await this.prisma.usuario.findMany({
      where: {
        status_usuario: {
          nome: { in: statusList },
        },
      },
      include: {
        status_usuario: true,
      },
    });
  }

  private async processarUsuarios(usuarios: usuario[]) {
    return await Promise.all(
      usuarios.map(async (user) => {
        const usuarioSemSenha = this.usuarioSemSenha(user);
        const userDocuments = await this.encontrarDocumentosUsuario(user.id);
        const usuarioFormatado = {
          ...usuarioSemSenha,
          userDocuments,
          cpf: formatarCPF(user.cpf!),
          telefone: formatarTelefone(user.telefone!),
        };
        return await this.adicionarFundosUsuario(usuarioFormatado);
      }),
    );
  }

  private async encontrarDocumentosUsuario(idUsuario: number) {
    return await this.prisma.documento.findMany({
      where: {
        id_usuario: idUsuario,
        status_documento: {
          nome: {
            in: [
              StatusDocumento.AGUARDANDO_ANALISE,
              StatusDocumento.APROVADO,
              StatusDocumento.RECUSADO,
            ],
          },
        },
      },
      include: {
        status_documento: true,
      },
    });
  }

  private usuarioSemSenha(user: usuario) {
    const { senha, ...usuarioSemSenha } = user;
    fazerNada(senha);
    return usuarioSemSenha;
  }

  private async adicionarFundosUsuario(user: any) {
    const fundosDoUsuario = await this.fundosService.buscarFundosDoUsuario(
      user.id,
    );

    const fundoComDocumentos = fundosDoUsuario.fundos_de_investimento;

    return {
      ...user,
      fundoComDocumentos,
    };
  }
}
