export class Documento {
  nome_arquivo: string;
  extensao: string;
  tipo_documento?: string;
  data_referencia: Date;
  data_upload: Date;
  url: string;
  id_status_documento: number;
}
