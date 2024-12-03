import { Documento, DocumentoSemVinculo } from 'src/@types/entities/documento';
import { Repositorio } from './repositorio';

export abstract class DocumentoRepositorio extends Repositorio {
  abstract buscarPorId(idDocumento: number): Promise<Documento | null>;

  abstract criar(
    dadosDocumento: Omit<DocumentoSemVinculo, 'id'>,
  ): Promise<Documento>;

  abstract atualizarDocumento(
    idDocumento: number,
    dadosDocumento: Partial<DocumentoSemVinculo>,
  ): Promise<Documento | null>;
}
