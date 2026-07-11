import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from '../interfaces/authenticated-request.interface';


@Injectable()
export class UserIdentificationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const payload = this.jwtService.decode(token) as AuthenticatedUser | null;
        if (payload) {
          req.user = payload;
        }
      } catch {
        
      }
    }

    next();
  }
}
