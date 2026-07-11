import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ApiErrorResponse } from '../interfaces/api-response.interface';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & Partial<AuthenticatedRequest>>();

    const statusCode = this.resolveStatusCode(exception);
    const { message, errors } = this.resolveMessage(exception);

    const errorBody: ApiErrorResponse = {
      success: false,
      message,
      errors,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    };

    this.logger.error(
      `[${request.method}] ${request.url} - ${statusCode} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
    );

    response.status(statusCode).json(errorBody);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): { message: string; errors: string[] } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { message: response, errors: [response] };
      }

      if (typeof response === 'object' && response !== null) {
        const responseObj = response as { message?: string | string[]; error?: string };
        const rawMessage = responseObj.message ?? responseObj.error ?? exception.message;
        const errors = Array.isArray(rawMessage) ? rawMessage : [String(rawMessage)];
        const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
        return { message, errors };
      }
    }

    if (exception instanceof Error) {
      return { message: exception.message, errors: [exception.message] };
    }

    return { message: 'Erro interno do servidor.', errors: ['Erro interno do servidor.'] };
  }
}
