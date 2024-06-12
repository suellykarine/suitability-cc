export interface CartaConviteData {
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
export interface ContentParam {
  nome: string;
  docusign?: string;
  urlDocumentosBackoffice?: string;
  codigo?: string;
  urlPlataforma?: string;
  nomeDoFundo?: string;
  novaSenha?: string;
}

export interface Mail {
  addressesCcTo: string[];
  addressesTo: string[];
  emailFrom: string;
  subject: string;
}

export interface RequestBase {
  contentParam: ContentParam;
  mail: Mail;
  templateName: string;
}
