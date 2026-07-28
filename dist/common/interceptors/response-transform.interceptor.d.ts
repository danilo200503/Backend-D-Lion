import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
export interface ControllerResponse<T> {
    message?: string;
    data: T;
}
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T | ControllerResponse<T>, ApiSuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T | ControllerResponse<T>>): Observable<ApiSuccessResponse<T>>;
    private isControllerResponse;
}
