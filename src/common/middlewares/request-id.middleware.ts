import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';


@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const incomingRequestId = req.headers['x-request-id'];
    req.requestId = typeof incomingRequestId === 'string' ? incomingRequestId : uuidv4();
    res.setHeader('X-Request-Id', req.requestId);
    next();
  }
}
