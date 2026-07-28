import { LoggerService, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
export declare class ExecutionTimeMiddleware implements NestMiddleware {
    private readonly logger;
    constructor(logger: LoggerService);
    use(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
