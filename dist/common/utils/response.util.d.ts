import { ControllerResponse } from '../interceptors/response-transform.interceptor';
export declare function buildResponse<T>(data: T, message?: string): ControllerResponse<T>;
