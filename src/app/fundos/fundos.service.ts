import { Injectable } from '@nestjs/common';
import {
  formatarCNPJ,
  formatarCPF,
  formatarTelefone,
} from 'src/utils/formatar';
import { StatusFundoInvestimento } from 'src/enums/StatusFundoInvestimento';
import { PerfisInvestimento } from 'src/enums/PerfisInvestimento';
import { CriarFundoDto } from './dto/criar-fundo.dto';
import { CriarFactoringDto } from './dto/criar-factoring.dto';
import { CriarSecuritizadoraDto } from './dto/criar-securitizaroda.dto copy';
import { AtualizarFundoDto } from './dto/atualizar-fundo.dto';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { CadastroPessoaJuridicaService } from '../sigma/cadastro-pessoa-juridica.service';
import { atualizarProcuradorDto } from '../sigma/dto/atualziarProcuradorInvestidorDto';
import { ProcuradorFundoRepositorio } from 'src/repositorios/contratos/procuradorFundoRepositorio';
import { EnderecoRepositorio } from 'src/repositorios/contratos/enderecoRepositorio';
import { Endereco } from 'src/@types/entities/endereco';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { Usuario, UsuarioFundoInvestimento } from 'src/@types/entities/usuario';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import {
  AdministradorFundo,
  FundoInvestimento,
  FundoInvestimentoGestorFundo,
  FundoInvestimentoSemVinculos,
  ProcuradorFundo,
  RepresentanteFundo,
} from 'src/@types/entities/fundos';
import { FundoBackofficeRepositorio } from 'src/repositorios/contratos/fundoBackofficeRepositorio';
import { AdministradorFundoRepositorio } from 'src/repositorios/contratos/admininstradorFundoRepositorio';
import { RepresentanteFundoRepositorio } from 'src/repositorios/contratos/representanteFundoRepositorio';
import { AdministradorFundoRepresentanteFundoRepositorio } from 'src/repositorios/contratos/administradorFundoRepresentanteFundoRepositorio';
import { GestorFundoRepositorio } from 'src/repositorios/contratos/gestorFundoRepositorio';
import { StatusFundoInvestimentoRepositorio } from 'src/repositorios/contratos/statusFundoInvestimentoRepositorio';
import { ContaRepasseRepositorio } from 'src/repositorios/contratos/contaRepasseRepositorio';
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { DocumentoRepositorio } from 'src/repositorios/contratos/documentoRepositorio';
import { StatusFundoInvestimento as statusFundo } from 'src/@types/entities/fundos';
import { ProcuradorFundoFundoInvestimentoRepositorio } from 'src/repositorios/contratos/procuradorFundoFundoInvestimentoRepositorio';
import { TipoUsuarioEnum } from 'src/enums/TipoUsuario';
import {
  ErroAplicacao,
  ErroConflitoRequisicao,
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
} from 'src/helpers/erroAplicacao';
import { fazerNada } from 'src/utils/funcoes/geral';

@Injectable()
export class FundosService {
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly cadastroPessoaJuridicaService: CadastroPessoaJuridicaService,
    private readonly procuradorFundoRepositorio: ProcuradorFundoRepositorio,
    private readonly enderecoRepositorio: EnderecoRepositorio,
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly usuarioFundoInvestimentoRepositorio: UsuarioFundoInvestimentoRepositorio,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly fundoBackofficeRepositorio: FundoBackofficeRepositorio,
    private readonly administradorFundoRepositorio: AdministradorFundoRepositorio,
    private readonly representanteFundoRepositorio: RepresentanteFundoRepositorio,
    private readonly administradorFundoRepresentanteFundoRepositorio: AdministradorFundoRepresentanteFundoRepositorio,
    private readonly gestorFundoRepositorio: GestorFundoRepositorio,
    private readonly statusFundoInvestimentoRepositorio: StatusFundoInvestimentoRepositorio,
    private readonly contaRepasseRepositorio: ContaRepasseRepositorio,
    private readonly fundoInvestimentoGestorFundoRepositorio: FundoInvestimentoGestorFundoRepositorio,
    private readonly documentoRepositorio: DocumentoRepositorio,
    private readonly procuradorFundoFundoInvestimentoRepositorio: ProcuradorFundoFundoInvestimentoRepositorio,
  ) {}

  async criarFundo(id: number, criarFundoDto: CriarFundoDto[]) {
    const usuario = await this.obterUsuario(id);
    let procurador: ProcuradorFundo;

    const transacao = await this.adaptadorDb.fazerTransacao(async () => {
      const fundosCriados: FundoInvestimento[] = [];
      for (const fundoDto of criarFundoDto) {
        await this.verificarFundoJaExistente(fundoDto.cpf_cnpj);

        const novoFundo = await this.criarNovoFundo(fundoDto, usuario);

        fundosCriados.push(novoFundo.novoFundo);
        procurador = novoFundo.procurador_fundo;
      }

      return {
        mensagem: 'Fundos criados com sucesso',
        fundos_criados: fundosCriados,
        procurador_fundo: procurador,
      };
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);

    if (transacao) {
      return transacao;
    }
  }

  async criarFactoring(id: number, criarFundoDto: CriarFactoringDto[]) {
    const usuario = await this.obterUsuario(id);

    if (!usuario) {
      throw new ErroNaoEncontrado({
        mensagem: 'Usuario não encontrado',
        acao: 'FundosService.criarFactoring',
        detalhes: {
          id,
          criarFundoDto,
        },
      });
    }

    const transacao = await this.adaptadorDb.fazerTransacao(async () => {
      const factoringsCriadas: FundoInvestimento[] = [];

      for (const factoringDto of criarFundoDto) {
        await this.verificarFundoJaExistente(factoringDto.cpf_cnpj);

        const novaFactoring = await this.criarNovaFactoring(
          factoringDto,
          usuario,
        );

        factoringsCriadas.push(novaFactoring);
      }

      return {
        mensagem: 'Factorings criadas com sucesso',
        factorings_criadas: factoringsCriadas,
      };
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);

    if (transacao) {
      return transacao;
    }
  }

  async criarSecuritizadora(
    id: number,
    criarFundoDto: CriarSecuritizadoraDto[],
  ) {
    const usuario = await this.obterUsuario(id);

    if (!usuario) {
      throw new ErroNaoEncontrado({
        mensagem: 'Usuario não encontrado',
        acao: 'FundosService.criarSecuritizadora',
        detalhes: {
          id,
          criarFundoDto,
        },
      });
    }

    const transacao = await this.adaptadorDb.fazerTransacao(async () => {
      const securitizadorasCriadas: FundoInvestimento[] = [];

      for (const securitizadoraDto of criarFundoDto) {
        await this.verificarFundoJaExistente(securitizadoraDto.cpf_cnpj);

        const novaSecuritizadora = await this.criarNovaSecuritizadora(
          securitizadoraDto,
          usuario,
        );

        securitizadorasCriadas.push(novaSecuritizadora);
      }

      return {
        mensagem: 'Securitizadoras criadas com sucesso',
        securitizadoras_criadas: securitizadorasCriadas,
      };
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);

    if (transacao) {
      return transacao;
    }
  }

  async buscarFundos() {
    return (await this.fundoInvestimentoRepositorio.bucarFundos()).map(
      (fundo) => {
        return {
          ...fundo,
          cpf_cnpj: formatarCNPJ(fundo.cpf_cnpj),
        };
      },
    );
  }

  async buscarFundosDoUsuario(idUsuario: number) {
    const fundosDoUsuario =
      await this.usuarioFundoInvestimentoRepositorio.encontrarPorIdUsuarioComRelacionamento(
        idUsuario,
      );

    const fundos = fundosDoUsuario.map(
      (usuarioFundoInvestimento: UsuarioFundoInvestimento) => {
        return usuarioFundoInvestimento.fundo_investimento_gestor_fundo
          .fundo_investimento;
      },
    );

    const fundosFormatados = fundos.map((fundo: any) => {
      let representanteFormatado;

      if (fundo.administrador_fundo) {
        const representantes =
          fundo.administrador_fundo.administrador_fundo_representante_fundo;
        representanteFormatado = representantes.map((ele: any) => ({
          ...ele.representante_fundo,
          cpf: ele.cpf ? formatarCPF(ele.representante_fundo.cpf) : '',
          telefone: ele.telefone
            ? formatarTelefone(ele.representante_fundo.telefone)
            : '',
        }));

        return {
          ...fundo,
          cnpj: formatarCNPJ(fundo.cpf_cnpj),
          fundo_backoffice: {
            ...fundo.fundo_backoffice,
            telefone: formatarTelefone(fundo.fundo_backoffice.telefone),
          },
          administrador_fundo: {
            ...fundo.administrador_fundo,
            cnpj: formatarCNPJ(fundo.administrador_fundo.cnpj),
            telefone: formatarTelefone(fundo.administrador_fundo.telefone),
            representante_fundo: representanteFormatado,
          },
        };
      } else {
        const representante = fundo.representante_fundo;
        representanteFormatado = {
          ...representante,
          cpf: representante.cpf ? formatarCPF(representante.cpf) : '',
          telefone: representante.telefone
            ? formatarTelefone(representante.telefone)
            : '',
        };

        return {
          ...fundo,
          cnpj: formatarCNPJ(fundo.cpf_cnpj),
          fundo_backoffice: {
            ...fundo.fundo_backoffice,
            telefone: formatarTelefone(fundo.fundo_backoffice.telefone),
          },
          representante_fundo: representanteFormatado,
        };
      }
    });

    return { fundos_de_investimento: fundosFormatados };
  }

  async patchFundo(
    id: number,
    data: AtualizarFundoDto,
    tipoEstrutura: PerfisInvestimento,
    idUsuario: number,
  ) {
    tipoEstrutura = tipoEstrutura ? tipoEstrutura : PerfisInvestimento.FUNDO;
    const fundo =
      await this.fundoInvestimentoRepositorio.encontrarPorIdETipoEstrutura(
        id,
        tipoEstrutura,
      );

    if (!fundo) {
      throw new ErroNaoEncontrado({
        mensagem: `${tipoEstrutura} não encontrado`,
        acao: 'FundosService.patchFundo',
        detalhes: {
          id,
          data,
          tipoEstrutura,
          idUsuario,
        },
      });
    }

    await this.verificarPropriedadeFundo(idUsuario, fundo.id);

    const transacao = await this.adaptadorDb.fazerTransacao(async () => {
      if (data.cpf_procurador) {
        const telefoneCompleto = data.telefone_procurador.replace(/\D/g, '');
        const ddd = telefoneCompleto.slice(0, 2);
        const numero =
          telefoneCompleto.slice(2).length === 11
            ? telefoneCompleto.slice(3)
            : telefoneCompleto.slice(2);

        const procuradorInvestidor: atualizarProcuradorDto = {
          nome: data.nome_procurador,
          endereco: {
            uf: data.estado_endereco_procurador,
            cep: data.cep_endereco_procurador,
            cidade: data.municipio_endereco_procurador,
            bairro: data.bairro_endereco_procurador,
            logradouro: data.rua_endereco_procurador,
            numero: data.numero_endereco_procurador,
            complemento: '',
          },
          telefone: {
            numero,
            ddd,
          },
          email: data.email_procurador,
          dadosAssinatura: {
            tipoAssinatura: 'C',
            dataValidadeAssinatura: '2025-12-31',
            possuiCertificadoDigital: true,
            tipoDocumento: 'P',
          },
        };

        const procurador =
          await this.procuradorFundoRepositorio.buscarProcuradorPorCpf(
            data.cpf_procurador,
          );

        await this.atualizarProcurador(
          fundo.cpf_cnpj,
          data.cpf_procurador,
          procuradorInvestidor,
          procurador.id,
          procurador.endereco.id,
          data.telefone_procurador,
        );
      }

      const statusFundo = await this.obterStatusFundoPatch(data.status);

      if (data.status && Object.keys(data).length === 1) {
        return this.atualizarStatusFundo(fundo.id, statusFundo);
      }

      await this.atualizarEntidadesAssociadas(fundo, data);

      await this.fundoInvestimentoRepositorio.atualizar(
        fundo.id,
        this.transformarParaFundoSemVinculos(data),
      );

      return {
        mensagem: `${tipoEstrutura} atualizado`,
      };
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);

    if (transacao) {
      return transacao;
    }
  }

  private async atualizarProcurador(
    fundoCnpj: string,
    procuradorCpf: string,
    procurador: atualizarProcuradorDto,
    id: number,
    idEndereco: number,
    telefoneProcurador: string,
  ) {
    const procuradorAtualizadoSigma = true;
    await this.cadastroPessoaJuridicaService.atualizarProcuradorInvestidor(
      fundoCnpj,
      procuradorCpf,
      procurador,
    );

    const { telefone, endereco, ...procuradorSemTelefoneEndereco } = procurador;

    fazerNada(telefone);

    if (procuradorAtualizadoSigma) {
      const enderecoProcuradorFormatado = {
        ...endereco,
        estado: endereco.uf,
      };
      delete enderecoProcuradorFormatado.uf;
      await this.atualizarEndereco(enderecoProcuradorFormatado, idEndereco);
      delete procuradorSemTelefoneEndereco.dadosAssinatura;
      await this.procuradorFundoRepositorio.atualizar(id, {
        telefone: telefoneProcurador,
        ...procuradorSemTelefoneEndereco,
      });
    }
  }

  private async atualizarEndereco(
    endereco: Partial<Endereco>,
    id: number,
  ): Promise<Endereco | null> {
    if (!endereco) {
      return null;
    }
    return await this.enderecoRepositorio.atualizar(id, endereco);
  }

  async deleteFundo(
    id: number,
    idGestorFundo: number,
    tipoEstrutura: PerfisInvestimento,
    idUsuario: number,
  ) {
    tipoEstrutura = tipoEstrutura ? tipoEstrutura : PerfisInvestimento.FUNDO;
    if (!idGestorFundo) {
      throw new ErroRequisicaoInvalida({
        mensagem: 'Id do gestor do fundo necessário',
        acao: 'FundosService.deleteFundo',
        detalhes: {
          id,
          idGestorFundo,
          tipoEstrutura,
          idUsuario,
        },
      });
    }
    const fundo =
      await this.fundoInvestimentoRepositorio.encontrarPorIdETipoEstrutura(
        id,
        tipoEstrutura,
      );

    if (!fundo) {
      throw new ErroNaoEncontrado({
        mensagem: `${tipoEstrutura} não encontrado`,
        acao: 'FundosService.atualizaEndereco',
        detalhes: {
          fundoId: id,
          tipoEstrutura,
        },
      });
    }

    await this.verificarPropriedadeFundo(idUsuario, fundo.id);

    if (fundo.tipo_estrutura === PerfisInvestimento.FUNDO) {
      await this.removerEntidadesAssociadasEFundo(fundo, idGestorFundo);
    } else {
      await this.removerEntidadesAssociadasEFactoringOuSecuritizadora(
        fundo.id,
        idGestorFundo,
        fundo.tipo_estrutura,
      );
    }

    return { mensagem: `${tipoEstrutura} removido com sucesso` };
  }

  private async criarNovoFundo(fundo: CriarFundoDto, usuario: any) {
    const gestorFundo = await this.obterGestorFundo(fundo.cnpj_gestor_fundo);
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
    );
    const administradorFundoFinal = await this.obterOuCriarAdministradorFundo(
      fundo.email_administrador,
      fundo.nome_administrador,
      fundo.cnpj_administrador,
      fundo.telefone_administrador,
    );
    const representante = await this.obterOuCriarRepresentante(
      fundo,
      administradorFundoFinal,
      PerfisInvestimento.FUNDO,
    );
    const statusFundo = await this.obterStatusFundo();

    const novoFundo = await this.fundoInvestimentoRepositorio.criar({
      nome: fundo.nome,
      cpf_cnpj: fundo.cpf_cnpj,
      apto_debenture: false,
      razao_social: fundo.razao_social,
      nome_fantasia: fundo.nome_fantasia,
      codigo_anbima: fundo.codigo_anbima,
      classe_anbima: fundo.classe_anbima,
      atividade_principal: fundo.atividade_principal || '',
      detalhes: fundo.detalhes || '',
      data_criacao: new Date(),
      tipo_estrutura: PerfisInvestimento.FUNDO,
      id_administrador_fundo: administradorFundoFinal.id,
      id_fundo_backoffice: backOffice.id,
      id_representante_fundo: representante?.id,
      id_status_fundo_investimento: statusFundo?.id,
      faturamento_anual: String(fundo.faturamento_anual),
    });

    const procurador = await this.cadastrarProcurador(novoFundo.id, fundo);

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novoFundo.id, fundo);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novoFundo.id,
      gestorFundo.id,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
    );

    return {
      novoFundo: novoFundo,
      procurador_fundo: procurador,
    };
  }

  private async criarNovaFactoring(fundo: CriarFactoringDto, usuario: Usuario) {
    const gestorFundo = await this.obterGestorFundo(fundo.cnpj_gestor_fundo);
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
    );
    const representante = await this.obterOuCriarRepresentante(fundo);
    const statusFundo = await this.obterStatusFundo();

    const novaFactoring = await this.fundoInvestimentoRepositorio.criar({
      nome: fundo.nome,
      apto_debenture: false,
      cpf_cnpj: fundo.cpf_cnpj,
      razao_social: fundo.razao_social,
      nome_fantasia: fundo.nome_fantasia,
      atividade_principal: fundo.atividade_principal || '',
      detalhes: fundo.detalhes || '',
      tipo_estrutura: PerfisInvestimento.FACTORING,
      id_fundo_backoffice: backOffice.id,
      id_representante_fundo: representante?.id,
      id_status_fundo_investimento: statusFundo?.id,
      data_criacao: new Date(),
      faturamento_anual: String(fundo.faturamento_anual),
    });

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novaFactoring.id, fundo);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novaFactoring.id,
      gestorFundo.id,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
    );

    return novaFactoring;
  }

  private async criarNovaSecuritizadora(
    fundo: CriarSecuritizadoraDto,
    usuario: any,
  ) {
    const gestorFundo = await this.obterGestorFundo(fundo.cnpj_gestor_fundo);
    const backOffice = await this.obterOuCriarBackOffice(
      fundo.nome_backoffice,
      fundo.email_backoffice,
      fundo.telefone_backoffice,
    );
    const representante = await this.obterOuCriarRepresentante(fundo);
    const statusFundo = await this.obterStatusFundo();

    const novaSecuritizadora = await this.fundoInvestimentoRepositorio.criar({
      nome: fundo.nome,
      apto_debenture: false,
      cpf_cnpj: fundo.cpf_cnpj,
      razao_social: fundo.razao_social,
      nome_fantasia: fundo.nome_fantasia,
      atividade_principal: fundo.atividade_principal || '',
      detalhes: fundo.detalhes || '',
      tipo_estrutura: PerfisInvestimento.SECURITIZADORA,
      id_fundo_backoffice: backOffice.id,
      id_representante_fundo: representante?.id,
      id_status_fundo_investimento: statusFundo?.id,
      data_criacao: new Date(),
      faturamento_anual: String(fundo.faturamento_anual),
    });

    if (fundo.codigo_banco && fundo.agencia_banco && fundo.conta_banco) {
      await this.criarContaRepasse(novaSecuritizadora.id, fundo);
    }

    const fundoInvestimentoGestorFundo = await this.ligarFundoComGestor(
      novaSecuritizadora.id,
      gestorFundo.id,
    );
    await this.associarFundoComUsuario(
      fundoInvestimentoGestorFundo,
      usuario.id,
    );

    return novaSecuritizadora;
  }

  private async obterUsuario(id: number) {
    const usuario = await this.usuarioRepositorio.encontrarPorId(id);
    if (!usuario) {
      throw new ErroNaoEncontrado({
        mensagem: 'Usuário não encontrado',
        acao: 'FundosService.criarNovaSecuritizadora',
        detalhes: {
          idUsuario: id,
        },
      });
    }
    return usuario;
  }

  private async obterGestorFundo(cnpj: string) {
    const gestorFundo =
      await this.gestorFundoRepositorio.encontrarPorCnpj(cnpj);

    if (!gestorFundo) {
      throw new ErroNaoEncontrado({
        mensagem: 'Gestor não encontrado.',
        acao: 'FundosService.obterGestorFundo',
        detalhes: {
          cnpj,
        },
      });
    }
    return gestorFundo;
  }

  private async obterOuCriarBackOffice(
    nome: string,
    email: string,
    telefone: string,
  ) {
    const backOfficeJaExistente =
      await this.fundoBackofficeRepositorio.encontrarPorEmail(email);

    if (!backOfficeJaExistente) {
      const novoBackOffice = await this.fundoBackofficeRepositorio.criar({
        nome,
        email,
        telefone,
      });
      return novoBackOffice;
    }
    return backOfficeJaExistente;
  }

  private async obterOuCriarAdministradorFundo(
    email: string,
    nome: string,
    cnpj: string,
    telefone: string,
  ) {
    const administradorFundo =
      await this.administradorFundoRepositorio.encontrarPorEmail(email);

    if (!administradorFundo) {
      const novoAdministradorFundo =
        await this.administradorFundoRepositorio.criar({
          email,
          nome,
          cnpj,
          telefone,
        });
      return novoAdministradorFundo;
    }
    return administradorFundo;
  }
  async obterOuCriarRepresentante(
    fundo: CriarFundoDto | CriarFactoringDto | CriarSecuritizadoraDto,
    admininstrador_fundo?: AdministradorFundo,
    tipo_estrutura?: string,
  ): Promise<RepresentanteFundo | null> {
    if (
      fundo.cpf_representante ||
      fundo.email_representante ||
      fundo.telefone_representante
    ) {
      let representante =
        await this.representanteFundoRepositorio.encontrarPorContato(
          fundo.cpf_representante,
          fundo.telefone_representante,
          fundo.email_representante,
        );

      if (
        tipo_estrutura === PerfisInvestimento.FUNDO &&
        representante &&
        'email_administrador' in fundo &&
        admininstrador_fundo &&
        !(await this.administradorFundoRepresentanteFundoRepositorio.verificarVinculoAdministradorRepresentante(
          admininstrador_fundo.id,
          representante.id,
        ))
      ) {
        throw new ErroRequisicaoInvalida({
          mensagem: 'Representante associado a outro administrador',
          acao: 'FundosService.obterOuCriarRepresentante',
          detalhes: {
            admininstrador_fundo,
            tipo_estrutura,
            fundo,
          },
        });
      }

      if (!representante) {
        const enderecoRepresentante = await this.enderecoRepositorio.criar({
          cep: fundo.cep_endereco_representante!,
          bairro: fundo.bairro_endereco_representante!,
          estado: fundo.estado_endereco_representante!,
          cidade: fundo.municipio_endereco_representante!,
          logradouro: fundo.rua_endereco_representante!,
          numero: fundo.numero_endereco_representante!,
          pais: 'Brasil',
        });

        representante =
          await this.representanteFundoRepositorio.criarRepresentante({
            cpf: fundo.cpf_representante!,
            email: fundo.email_representante!,
            nome: fundo.nome_representante!,
            telefone: fundo.telefone_representante!,
            id_endereco: enderecoRepresentante.id,
          });

        if (
          tipo_estrutura === PerfisInvestimento.FUNDO &&
          admininstrador_fundo
        ) {
          await this.administradorFundoRepresentanteFundoRepositorio.criarVinculoAdministradorRepresentante(
            admininstrador_fundo.id,
            representante.id,
          );
        }
      }

      return representante;
    }

    return null;
  }

  private async obterStatusFundo() {
    return await this.statusFundoInvestimentoRepositorio.encontrarPorNome(
      StatusFundoInvestimento.AGUARDANDO_ANALISE,
    );
  }

  private async criarContaRepasse(
    idFundo: number,
    fundo: CriarFundoDto | CriarFactoringDto | CriarSecuritizadoraDto,
  ) {
    return await this.contaRepasseRepositorio.criar({
      codigo_banco: fundo.codigo_banco!,
      agencia: fundo.agencia_banco!,
      conta_bancaria: fundo.conta_banco!,
      id_fundo_investimento: idFundo,
    });
  }

  private async ligarFundoComGestor(idFundo: number, idGestor: number) {
    return await this.fundoInvestimentoGestorFundoRepositorio.criar({
      id_fundo_investimento: idFundo,
      id_gestor_fundo: idGestor,
    });
  }

  private async associarFundoComUsuario(
    fundoGestorFundo: FundoInvestimentoGestorFundo,
    idUsuario: number,
  ) {
    return await this.usuarioFundoInvestimentoRepositorio.criar({
      id_fundo_investimento_gestor_fundo: fundoGestorFundo.id,
      id_usuario: idUsuario,
      acesso_permitido: true,
    });
  }

  private async obterStatusFundoPatch(status?: string) {
    return await this.statusFundoInvestimentoRepositorio.encontrarPorNome(
      status || StatusFundoInvestimento.AGUARDANDO_ANALISE,
    );
  }

  private async atualizarStatusFundo(
    idFundo: number,
    statusFundo: statusFundo,
  ) {
    const fundoAtualizado = await this.fundoInvestimentoRepositorio.atualizar(
      idFundo,
      { id_status_fundo_investimento: statusFundo.id },
    );

    return {
      mensagem: 'Status atualizado com sucesso',
      fundo_atualizado: fundoAtualizado,
    };
  }
  private async atualizarEntidadesAssociadas(
    fundo: FundoInvestimento,
    data: AtualizarFundoDto,
  ) {
    if (
      data.email_backoffice &&
      data.nome_backoffice &&
      data.telefone_backoffice
    ) {
      await this.fundoBackofficeRepositorio.atualizar(
        fundo.id_fundo_backoffice!,
        {
          email: data.email_backoffice,
          nome: data.nome_backoffice,
          telefone: data.telefone_backoffice,
        },
      );
    }

    if (
      data.email_administrador &&
      data.nome_administrador &&
      data.telefone_administrador
    ) {
      await this.administradorFundoRepositorio.atualizar(
        fundo.id_administrador_fundo!,
        {
          email: data.email_administrador,
          nome: data.nome_administrador,
          telefone: data.telefone_administrador,
          cnpj: data.cnpj_administrador!,
        },
      );
    }

    if (
      data.nome_representante &&
      data.telefone_representante &&
      data.cpf_representante
    ) {
      const representanteAtual =
        await this.representanteFundoRepositorio.atualizar(
          fundo.id_representante_fundo!,
          {
            nome: data.nome_representante,
            telefone: data.telefone_representante,
            cpf: data.cpf_representante,
            email: data.email_representante,
          },
        );

      if (representanteAtual) {
        await this.enderecoRepositorio.atualizar(
          representanteAtual.id_endereco!,
          {
            cep: data.cep_endereco_representante!,
            logradouro: data.rua_endereco_representante!,
            numero: data.numero_endereco_representante!,
            bairro: data.bairro_endereco_representante!,
            cidade: data.municipio_endereco_representante!,
            estado: data.estado_endereco_representante!,
          },
        );
      }
    }

    if (data.codigo_banco && data.agencia_banco && data.conta_banco) {
      await this.contaRepasseRepositorio.atualizar(fundo.id, {
        codigo_banco: data.codigo_banco,
        agencia: data.agencia_banco,
        conta_bancaria: data.conta_banco,
      });
    }
  }
  private async removerEntidadesAssociadasEFundo(
    fundo: FundoInvestimento,
    idGestorFundo: number,
  ) {
    return await this.adaptadorDb.fazerTransacao(async () => {
      const fundosGestores =
        await this.fundoInvestimentoGestorFundoRepositorio.buscarPorFundoEGestor(
          fundo.id,
          idGestorFundo,
        );

      for (const gestor of fundosGestores) {
        await this.usuarioFundoInvestimentoRepositorio.removerPorFundoGestor(
          gestor.id,
        );
        await this.fundoInvestimentoGestorFundoRepositorio.remover(gestor.id);
      }

      await this.contaRepasseRepositorio.removerPorFundo(fundo.id);

      await this.documentoRepositorio.removerPorFundo(fundo.id);

      const fundosComAdministrador =
        await this.fundoInvestimentoRepositorio.buscarPorAdministrador(
          fundo.id_administrador_fundo!,
        );

      await this.procuradorFundoFundoInvestimentoRepositorio.removerPorFundo(
        fundo.id,
      );

      if (fundo.tipo_estrutura === PerfisInvestimento.FUNDO) {
        const procurador =
          await this.procuradorFundoRepositorio.buscarProcuradorPorFundo(
            fundo.id,
          );

        if (procurador) {
          const procuradoresAssociados =
            await this.procuradorFundoFundoInvestimentoRepositorio.buscarPorProcurador(
              procurador.id,
            );

          if (procuradoresAssociados.length === 0) {
            await this.procuradorFundoRepositorio.remover(procurador.id);
            await this.enderecoRepositorio.remover(procurador.id_endereco);
          }
        }
      }

      const fundosComRepresentante =
        await this.fundoInvestimentoRepositorio.buscarPorRepresentante(
          fundo.id_representante_fundo!,
        );

      const fundosComBackoffice =
        await this.fundoInvestimentoRepositorio.buscarPorBackoffice(
          fundo.id_fundo_backoffice!,
        );

      if (!fundosComRepresentante[0]) {
        await this.fundoInvestimentoRepositorio.remover(fundo.id);
      }
      await this.fundoInvestimentoRepositorio.remover(fundo.id);

      if (fundosComAdministrador.length === 1) {
        const administradorFundoRepresentante =
          await this.administradorFundoRepresentanteFundoRepositorio.buscarPorAdministradorERepresentante(
            fundo.id_administrador_fundo!,
            fundo.id_representante_fundo!,
          );
        await this.administradorFundoRepresentanteFundoRepositorio.remover(
          administradorFundoRepresentante.id,
        );

        await this.administradorFundoRepositorio.remover(
          fundo.id_administrador_fundo!,
        );

        if (fundosComBackoffice.length === 1) {
          await this.fundoBackofficeRepositorio.remover(
            fundo.id_fundo_backoffice!,
          );
        }

        if (fundosComRepresentante.length === 1) {
          await this.representanteFundoRepositorio.remover(
            fundo.id_representante_fundo!,
          );
        }
      }
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);
  }

  async verificarPropriedadeFundo(idUsuario: number, idFundo: number) {
    const fundoGestor =
      await this.fundoInvestimentoGestorFundoRepositorio.encontrarPorFundo(
        idFundo,
      );

    if (!fundoGestor) {
      throw new ErroNaoEncontrado({
        mensagem: 'Fundo de investimento não encontrado.',
        acao: 'FundosService.verificarPropriedadeFundo',
        detalhes: { idUsuario, idFundo },
      });
    }

    const usuario = await this.obterUsuario(idUsuario);
    const usuarioFundo =
      await this.usuarioFundoInvestimentoRepositorio.encontrarPorUsuarioEFundoGestor(
        idUsuario,
        fundoGestor.id,
      );

    if (
      !usuarioFundo &&
      usuario.tipo_usuario.tipo !== TipoUsuarioEnum.BACKOFFICE
    ) {
      throw new ErroAplicacao({
        mensagem: 'Acesso negado. Você não é o proprietário deste fundo.',
        codigoStatus: 403,
        acao: 'FundosService.verificarPropriedadeFundo',
      });
    }

    return fundoGestor;
  }
  async cadastrarProcurador(idFundo: number, fundoDto: CriarFundoDto) {
    let procurador = await this.procuradorFundoRepositorio.encontrarPorCpf(
      fundoDto.cpf_procurador,
    );

    if (!procurador) {
      const enderecoProcurador = await this.enderecoRepositorio.criar({
        logradouro: fundoDto.rua_endereco_procurador,
        bairro: fundoDto.bairro_endereco_procurador,
        cidade: fundoDto.municipio_endereco_procurador,
        numero: fundoDto.numero_endereco_procurador,
        cep: fundoDto.cep_endereco_procurador,
        estado: fundoDto.estado_endereco_procurador,
        pais: 'Brasil',
      });

      procurador = await this.procuradorFundoRepositorio.criar({
        cpf: fundoDto.cpf_procurador,
        email: fundoDto.email_procurador,
        nome: fundoDto.nome_procurador,
        telefone: fundoDto.telefone_procurador,
        id_endereco: enderecoProcurador.id,
      });
    }

    await this.procuradorFundoFundoInvestimentoRepositorio.criar({
      id_fundo_investimento: idFundo,
      id_procurador_fundo: procurador.id,
    });

    return procurador;
  }

  async verificarFundoJaExistente(cnpjFundo: string): Promise<void> {
    const fundoJaExiste =
      await this.fundoInvestimentoRepositorio.encontrarPorCpfCnpj(cnpjFundo);

    if (fundoJaExiste) {
      throw new ErroConflitoRequisicao({
        mensagem: `Fundo com o cpf_cnpj ${cnpjFundo} já existe`,
        acao: 'FundosService.verificarFundoJaExistente',
        detalhes: { cnpjFundo },
      });
    }
  }

  async removerEntidadesAssociadasEFactoringOuSecuritizadora(
    id: number,
    assetId: number,
    perfilInvestimento: string,
  ): Promise<void> {
    return await this.adaptadorDb.fazerTransacao(async () => {
      const fundo =
        await this.fundoInvestimentoRepositorio.encontrarPorIdEPerfil(
          id,
          perfilInvestimento,
        );

      if (!fundo) {
        throw new ErroNaoEncontrado({
          mensagem: 'Factoring não encontrada',
          acao: 'FundosService.removerEntidadesAssociadasEFactoringOuSecuritizadora',
          detalhes: {
            id,
            assetId,
            perfilInvestimento,
          },
        });
      }
      const gestores =
        await this.fundoInvestimentoGestorFundoRepositorio.buscarPorFundoEGestor(
          fundo.id,
          assetId,
        );

      for (const gestor of gestores) {
        const usuario =
          await this.usuarioFundoInvestimentoRepositorio.buscarPorGestorFundo(
            gestor.id,
          );

        if (usuario) {
          await this.usuarioFundoInvestimentoRepositorio.remover(usuario.id);
        }
        await this.fundoInvestimentoGestorFundoRepositorio.remover(gestor.id);
      }

      await this.documentoRepositorio.removerPorFundo(fundo.id);
      await this.contaRepasseRepositorio.removerPorFundo(fundo.id);

      const fundosBackoffice =
        await this.fundoInvestimentoRepositorio.buscarPorBackoffice(
          fundo.id_fundo_backoffice,
        );

      const fundosRepresentante =
        await this.fundoInvestimentoRepositorio.buscarPorRepresentante(
          fundo.id_representante_fundo,
        );
      await this.fundoInvestimentoRepositorio.remover(fundo.id);

      if (fundosRepresentante.length === 1) {
        await this.representanteFundoRepositorio.remover(
          fundo.id_representante_fundo!,
        );
      }

      if (fundosBackoffice.length === 1) {
        await this.fundoBackofficeRepositorio.remover(
          fundo.id_fundo_backoffice!,
        );
      }
    }, [
      this.fundoInvestimentoRepositorio,
      this.procuradorFundoRepositorio,
      this.enderecoRepositorio,
      this.usuarioRepositorio,
      this.usuarioFundoInvestimentoRepositorio,
      this.fundoBackofficeRepositorio,
      this.administradorFundoRepositorio,
      this.representanteFundoRepositorio,
      this.administradorFundoRepresentanteFundoRepositorio,
      this.gestorFundoRepositorio,
      this.statusFundoInvestimentoRepositorio,
      this.contaRepasseRepositorio,
      this.fundoInvestimentoGestorFundoRepositorio,
      this.documentoRepositorio,
      this.procuradorFundoFundoInvestimentoRepositorio,
    ]);
  }

  async buscarEstaAptoADebenture(id: number) {
    const estaApto =
      await this.fundoInvestimentoRepositorio.buscarEstaAptoADebentureRepositorio(
        id,
      );
    if (!estaApto) {
      return {
        mensagem:
          'fundo de investimento não está apto ao investimento por debenture',
        data: estaApto,
      };
    }
    return {
      mensagem: 'fundo de investimento está apto ao investimento por debenture',
      data: estaApto,
    };
  }

  private transformarParaFundoSemVinculos(
    data: AtualizarFundoDto,
  ): Partial<FundoInvestimentoSemVinculos> {
    const fundoSemVinculos: Partial<FundoInvestimentoSemVinculos> = {};

    const camposValidos: (keyof FundoInvestimentoSemVinculos)[] = [
      'id',
      'nome',
      'razao_social',
      'nome_fantasia',
      'codigo_anbima',
      'classe_anbima',
      'atividade_principal',
      'id_status_fundo_investimento',
      'id_fundo_backoffice',
      'id_administrador_fundo',
      'id_representante_fundo',
      'detalhes',
      'data_criacao',
      'cpf_cnpj',
      'tipo_estrutura',
      'faturamento_anual',
      'apto_debenture',
      'valor_serie_debenture',
      'nota_investidor_suitability',
      'perfil_investidor_suitability',
      'data_expiracao_suitability',
    ];

    for (const campo of camposValidos) {
      if (campo in data) {
        fundoSemVinculos[campo as string] =
          data[campo as keyof AtualizarFundoDto];
      }
    }

    return fundoSemVinculos;
  }
}
