import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
export declare class LanguageMiddleware implements NestMiddleware {
    use(req: AuthenticatedRequest, _res: Response, next: NextFunction): void;
}
