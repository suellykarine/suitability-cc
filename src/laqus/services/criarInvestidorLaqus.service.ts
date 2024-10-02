import { HttpException, HttpStatus } from '@nestjs/common';
import { CriarInvestidorLaqusDto } from '../dto/criarInvestidorLaqus.dto';

export class CriarInvestidorLaqusService {
  async criarInvestidor(
    criarInvestidorLaqus: CriarInvestidorLaqusDto,
    token: string,
  ) {
    try {
      const response = await fetch(`${process.env.LAQUS_BASE_URL}cadastros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(criarInvestidorLaqus),
      });
      const res = await response.json();
      if (!response.ok) {
        const errorMessage = res.erro ? res.erro : response.statusText;
        throw new Error(`Erro ao criar investidor: ${errorMessage}`);
      }
      return res;
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Erro ao cadastrar o investidor';
      throw new HttpException(message, status);
    }
  }
}
