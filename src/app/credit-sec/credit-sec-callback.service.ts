import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BodyCallbackDto } from './dto/body-callback.dto';

@Injectable()
export class CallBackCreditSecService {
  constructor(private prisma: PrismaService) {}

  async registrarRetornoCreditSec(data: BodyCallbackDto) {
    try {
      const debentureSerie = await this.prisma.debenture_serie.findFirst({
        where: { numero_serie: data.numero_serie },
      });
      const debentureSerieInvestidor =
        await this.prisma.debenture_serie_investidor.findFirst({
          where: { id_debenture_serie: debentureSerie.id },
        });
      const atualizaDebentureSerieInvestidor =
        await this.prisma.debenture_serie_investidor.update({
          where: { id: debentureSerieInvestidor.id },
          data: {
            status_retorno_creditsec: data.status,
            mensagem_retorno_creditsec: data.motivo ?? null,
          },
        });
      return atualizaDebentureSerieInvestidor;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao registrar os dados',
      );
    }
  }
}
