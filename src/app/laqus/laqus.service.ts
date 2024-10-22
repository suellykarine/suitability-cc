import { HttpException, Injectable } from '@nestjs/common';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LaqusService {
  token: string;
  laqusApi: string;
  constructor(private readonly configService: ConfigService) {
    this.laqusApi = this.configService.get<string>('LAQUS_API');
    this.token = this.configService.get<string>('TOKEN_KEY');
  }

  async cadastrarInvestidor(data: CriarInvestidorLaqusDto) {
    const response = await fetch(this.laqusApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new HttpException(
        'Não foi possível cadastrar o investidor',
        response.status,
      );
    }

    return result;
  }

  async buscarStatusInvestidor(id: string) {
    const response = await fetch(
      `${this.laqusApi}/buscar-status-investidor/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    if (!response.ok) {
      throw new HttpException(
        'Não foi possível buscar o status do investidor',
        response.status,
      );
    }

    const result = await response.json();
    return result;
  }
}
