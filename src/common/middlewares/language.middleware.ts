import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

const IDIOMA_PADRAO = 'pt-BR';


@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const acceptLanguage = req.headers['accept-language'];
    req.language = acceptLanguage ? acceptLanguage.split(',')[0].trim() : IDIOMA_PADRAO;
    next();
  }
}
