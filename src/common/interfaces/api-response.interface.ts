
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}


export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
  status: number;
  timestamp: string;
  path: string;
  requestId?: string;
}
