import { Injectable } from '@nestjs/common';
import { Repositorio } from './repositorio';

export abstract class AdministradorFundoRepresentanteFundoRepositorio extends Repositorio {
  abstract criarVinculoAdministradorRepresentante(
    idAdministradorFundo: number,
    idRepresentanteFundo: number,
  ): Promise<void>;

  abstract verificarVinculoAdministradorRepresentante(
    idAdministradorFundo: number,
    idRepresentanteFundo: number,
  ): Promise<boolean>;

  abstract buscarPorAdministradorERepresentante(
    idAdministrador: number,
    idRepresentante: number,
  ): Promise<any>;
  abstract remover(id: number): Promise<void>;
}
