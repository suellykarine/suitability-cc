import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErroAplicacao } from '../erroAplicacao';
import { LogService } from 'src/app/global/logs/log.service';

@Catch()
export class TratamentoExcessoesFiltro implements ExceptionFilter {
  constructor(@Inject(LogService) private readonly logService: LogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ErroAplicacao) {
      const { message, codigoStatus, informacaoAdicional, acao, salvarEmLog } =
        exception;

      const payload = {
        mensagem: message,
        acao,
        informacaoAdicional: informacaoAdicional
          ? { ...informacaoAdicional, statusCode: codigoStatus }
          : undefined,
      };

      if (salvarEmLog) {
        this.logService.erro(payload);
      }

      return response.status(codigoStatus).json({
        error: { message, action: acao },
      });
    }

    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse() as any;
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: responseBody,
      });
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Erro desconhecido';

    this.logService.erro({
      mensagem: message,
      acao: 'unknown',
      informacaoAdicional: {
        statusCode: status,
        details: exception,
      },
    });

    if (
      status !== HttpStatus.INTERNAL_SERVER_ERROR &&
      exception instanceof HttpException
    ) {
      const corpoResposta = exception.getResponse();
      return response.status(status).json(corpoResposta);
    }

    return response.status(status).json({
      error: {
        message: `Erro interno do servidor: ${message}`,
      },
    });
  }
}
