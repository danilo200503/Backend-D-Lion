import { CallHandler, ExecutionContext, Inject, Injectable, LoggerService, NestInterceptor } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Partial<AuthenticatedRequest>>();
    const { method, url, requestId } = request;
    const ip = request.ip;
    const userId = request.user?.id ?? 'anônimo';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTimeMs = Date.now() - startTime;
        this.logger.log(
          `[${method}] ${url} - usuário: ${userId} - ip: ${ip} - ${responseTimeMs}ms - requestId: ${requestId}`,
          'LoggingInterceptor',
        );
      }),
    );
  }
}
