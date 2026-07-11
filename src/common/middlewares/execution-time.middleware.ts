import { Inject, Injectable, LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';


@Injectable()
export class ExecutionTimeMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      this.logger.log(
        `[${req.method}] ${req.originalUrl} finalizado em ${durationMs.toFixed(2)}ms com status ${res.statusCode}`,
        'ExecutionTimeMiddleware',
      );
    });

    next();
  }
}
