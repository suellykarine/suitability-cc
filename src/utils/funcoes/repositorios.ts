import { Repositorio } from 'src/repositorios/contratos/repositorio';

type Props = {
  repositorios: Repositorio[];
  contexto: unknown;
};

export function definirContextosDeTransacao({ repositorios, contexto }: Props) {
  repositorios.forEach((repositorio) => {
    repositorio.definirContextoDaTransacao(contexto);
  });
}

export function removerContextosDeTransacao({
  repositorios,
}: Pick<Props, 'repositorios'>) {
  repositorios.forEach((repositorio) => {
    repositorio.removerContextoDaTransacao();
  });
}
