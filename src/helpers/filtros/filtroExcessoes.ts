import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
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
      const {
        message,
        codigoStatus,
        informacaoAdicional,
        acao,
        salvarEmLog,
        stack,
      } = exception;

      const payload = {
        mensagem: message,
        acao,
        informacaoAdicional: {
          ...informacaoAdicional,
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
      const responseBody = exception.getResponse();

      await this.logService.erro({
        mensagem: responseBody.toString(),
        acao: 'desconhecida',
        informacaoAdicional: {
          codigoStatus: status,
          detalhes: exception,
          stack: exception.stack,
          nomeExcecao: exception.name,
          causa: exception.cause,
        },
      });

      return response.status(status).json({
        erro: { mensagem: responseBody },
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Error) {
      const mensagem = exception.message ?? 'Erro desconhecido';
      const acao = exception.stack ?? 'desconhecida';

      await this.logService.erro({
        mensagem,
        acao,
        informacaoAdicional: {
          codigoStatus: status,
          excecao: exception,
          nomeExcecao: exception.name,
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
      informacaoAdicional: {
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
