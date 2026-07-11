import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';


export interface ControllerResponse<T> {
  message?: string;
  data: T;
}


@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T | ControllerResponse<T>, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ControllerResponse<T>>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (this.isControllerResponse(result)) {
          return {
            success: true as const,
            message: result.message ?? 'Operação realizada com sucesso.',
            data: result.data,
          };
        }

        return {
          success: true as const,
          message: 'Operação realizada com sucesso.',
          data: result as T,
        };
      }),
    );
  }

  private isControllerResponse(value: unknown): value is ControllerResponse<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'data' in (value as Record<string, unknown>)
    );
  }
}
