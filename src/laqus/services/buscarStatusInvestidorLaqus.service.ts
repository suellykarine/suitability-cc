import {
  HttpStatus,
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BuscarStatusLaqusDto } from '../dto/buscarStatusLaqus.dto';

export class buscarStatusInvestidorLaqusService {
  async buscarStatusInvestidor({ id, token }: BuscarStatusLaqusDto) {
    try {
      const response = await fetch(
        `${process.env.LAQUS_BASE_URL}cadastros/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const res = await response.json();
      if (!response.ok) {
        const usuarioNaoExiste = res.statusCode === 404;
        if (usuarioNaoExiste)
          throw new NotFoundException('Entidade não encontrada');

        const RequisicaoInvalida = res.statusCode === 400;
        if (RequisicaoInvalida) throw new BadRequestException('uuid inválido');
      }

      return res;
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Erro ao cadastrar o investidor';
      throw new HttpException(message, status);
    }
  }
}
