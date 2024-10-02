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
        const errorMessage = res.erro ? res.erro : response.statusText;
        throw new Error(`Erro ao buscar status do investidor: ${errorMessage}`);
      }

      return res;
    } catch (error) {
      let errorMessage = 'Erro interno ao processar a solicitação.';

      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Erro interno da API.';
        } else if (error.message.includes('Cadastro já existe')) {
          errorMessage = 'Cadastro já existe.';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }
}
