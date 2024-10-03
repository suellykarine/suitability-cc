export abstract class Repositorio {
  abstract definirContextoDaTransacao(contexto: unknown): void;
  abstract removerContextoDaTransacao(): void;
}
