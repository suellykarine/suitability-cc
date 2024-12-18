import {
  ErroAplicacao,
  ErroServidorInterno,
  ErroRequisicaoInvalida,
  ErroNaoAutorizado,
  ErroNaoEncontrado,
  ErroConflitoRequisicao,
  ErroNaoProcessavel,
  AppErrorProps,
} from 'src/helpers/erroAplicacao';

type Props = {
  acao: string;
  status?: number;
  req: any;
  mensagem: string;
  infoAdicional: any;
};

const mapaDeErros: Record<
  number,
  new (props: Omit<AppErrorProps, 'codigoStatus'>) => ErroAplicacao
> = {
  400: ErroRequisicaoInvalida,
  401: ErroNaoAutorizado,
  404: ErroNaoEncontrado,
  409: ErroConflitoRequisicao,
  422: ErroNaoProcessavel,
  500: ErroServidorInterno,
};

export async function tratarErroRequisicao({
  acao,
  status,
  req,
  mensagem,
  infoAdicional,
}: Props) {
  const statusPreenchido = status ? `status: ${status}` : '';
  const ErroClasse = mapaDeErros[status] || ErroServidorInterno;

  try {
    const requisicao = await req.json();
    throw new ErroClasse({
      mensagem: `${mensagem}. ${statusPreenchido}.`,
      acao,
      informacaoAdicional: {
        requisicao,
        req,
        ...infoAdicional,
      },
    });
  } catch (erro) {
    if (erro instanceof ErroAplicacao) throw erro;
    throw new ErroClasse({
      mensagem: `${mensagem}. ${statusPreenchido}.`,
      acao,
      informacaoAdicional: {
        req,
        ...infoAdicional,
        erro: erro?.message,
      },
    });
  }
}
