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

export interface SolicitacaoBase {
  contentParam: ContentParam;
  mail: Mail;
  templateName: string;
  origin?: string;
  sendType?: string;
}
