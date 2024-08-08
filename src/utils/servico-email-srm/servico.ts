interface ISolicitacaoEmail {
  contentParam: {
    nome?: string;
    docusign?: string;
    nomeDoFundo?: string;
    urlDocumentosBackoffice?: string;
    urlPlataforma?: string;
    codigo?: string;
    novaSenha?: string;
  };
  mail: {
    addressesCcTo?: string[];
    addressesTo: string[];
    emailFrom?: string;
    subject: string;
  };
  origin?: string;
  sendType?: string;
  templateName: string;
}

export async function servicoEmailSrm(email: ISolicitacaoEmail) {
  try {
    const emailData: ISolicitacaoEmail = {
      contentParam: {
        nome: email.contentParam.nome,
        docusign: email.contentParam.docusign,
        nomeDoFundo: email.contentParam.nomeDoFundo,
        urlDocumentosBackoffice: email.contentParam.urlDocumentosBackoffice,
        urlPlataforma: email.contentParam.urlPlataforma,
        codigo: email.contentParam.codigo,
        novaSenha: email.contentParam.novaSenha,
      },
      mail: {
        addressesCcTo: email.mail.addressesCcTo || [],
        addressesTo: email.mail.addressesTo,
        emailFrom: email.mail.emailFrom || 'srmasset@srmasset.com.br',
        subject: email.mail.subject,
      },
      origin: email.origin || 'SRM',
      sendType: email.sendType || 'LOTE',
      templateName: email.templateName,
    };

    const res = await fetch(
      `${process.env.SRM_EMAIL_URL}/v1/email/send-template`,
      {
        method: 'POST',
        body: JSON.stringify(emailData),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!res.ok) {
      const mensagemErro = await res.json();
      return mensagemErro;
    }
    return res;
  } catch (erro: any) {
    throw erro;
  }
}
