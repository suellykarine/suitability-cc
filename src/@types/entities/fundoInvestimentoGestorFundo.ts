import { FundoInvestimento } from './fundos';
import { GestorFundo } from './gestorFundo';
import { UsuarioFundoInvestimento } from './usuario';

export type FundoInvestimentoGestorFundo = {
  id: number;
  id_fundo_investimento: number;
  id_gestor_fundo: number;
  fundo_investimento: FundoInvestimento;
  gestor_fundo: GestorFundo;
  usuario_fundo_investimento?: UsuarioFundoInvestimento[];
};
