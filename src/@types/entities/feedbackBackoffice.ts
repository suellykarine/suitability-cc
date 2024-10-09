import { Documento } from './documento';
import { FundoInvestimento } from './fundos';
import { Usuario } from './usuario';

export type FeedbackBackoffice = {
  id: number;
  id_usuario_backoffice?: number;
  id_usuario_investidor?: number;
  id_documento?: number;
  mensagem?: string;
  id_fundo_investimento?: number;
  documento?: Documento;
  fundo_investimento?: FundoInvestimento;
  usuario_backoffice?: Usuario;
  usuario_investidor?: Usuario;
};
