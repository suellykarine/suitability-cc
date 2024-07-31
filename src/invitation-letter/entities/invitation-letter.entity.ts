export class InvitationLetter {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  mensagem: string;
  cpf: string;
  cnpj: string;
  status_carta_convite: { connect: { id: number } };
  usuario?: { connect: { id: number } };
}
