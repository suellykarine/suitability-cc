import { Documento } from 'src/@types/entities/documento';
import { Repositorio } from './repositorio';

export abstract class DocumentoRepositorio extends Repositorio {
  abstract buscarPorId(idDocumento: number): Promise<Documento | null>;

  abstract atualizarDocumento(
    idDocumento: number,
    dadosDocumento: Documento,
  ): Promise<Documento | null>;
}
