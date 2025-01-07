import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErroAplicacao } from '../erroAplicacao';
import { LogService } from 'src/app/global/logs/log.service';

@Catch()
export class TratamentoExcessoesFiltro implements ExceptionFilter {
  constructor(@Inject(LogService) private readonly logService: LogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ErroAplicacao) {
      const { message, codigoStatus, detalhes, acao, salvarEmLog, stack } =
        exception;

      const payload = {
        mensagem: message,
        acao,
        detalhes: {
          ...detalhes,
          codigoStatus,
          stack,
        },
      };

      if (salvarEmLog) {
        await this.logService.erro(payload);
      }

      return response.status(codigoStatus).json({
        erro: { mensagem: message, acao },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse() as {
        message: string;
        statusCode: number;
        error: string;
      };
      const isBadRequest = exception instanceof BadRequestException;
      const isUnauthorized = exception instanceof UnauthorizedException;

      if (!isBadRequest && !isUnauthorized) {
        await this.logService.erro({
          mensagem: responseBody.message,
          acao: 'desconhecida',
          detalhes: {
            codigoStatus: status,
            detalhes: exception,
            stack: exception.stack,
            nomeExcecao: exception.name,
            causa: exception.cause,
            objetoErro: responseBody.message,
          },
        });
      }

      return response.status(status).json({
        erro: { mensagem: responseBody.message },
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Error) {
      const mensagem = exception.message ?? 'Erro desconhecido';
      const acao = 'desconhecida';

      await this.logService.erro({
        mensagem,
        acao,
        detalhes: {
          codigoStatus: status,
          excecao: exception,
          nomeExcecao: exception.name,
          stack: exception.stack,
        },
      });

      return response.status(status).json({
        erro: {
          mensagem: `Erro interno do servidor: ${mensagem}`,
        },
      });
    }

    await this.logService.erro({
      mensagem: 'erro desconhecido',
      acao: 'desconhecida',
      detalhes: {
        codigoStatus: status,
        excecao: exception,
      },
    });

    return response.status(status).json({
      erro: {
        mensagem: `Erro interno do servidor`,
      },
    });
  }
}
