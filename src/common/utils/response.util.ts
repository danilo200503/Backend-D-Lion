import { ControllerResponse } from '../interceptors/response-transform.interceptor';


export function buildResponse<T>(data: T, message?: string): ControllerResponse<T> {
  return { data, message };
}
