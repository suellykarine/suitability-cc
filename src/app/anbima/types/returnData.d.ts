import { Fundo, SerieHistorica } from '@/@types/entities/anbima';

export type GetAnbimaFundosData = {
  content: Fundo[];
  pageable: Pageable;
  totalSize: number;
};

export type GetSerieHistoricaData = {
  content: SerieHistorica[];
  pageable: Pageable;
  total_size: number;
};
