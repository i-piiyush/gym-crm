export type ActionResult<T> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
      validationErrors?: Record<string, string[]>;
    };

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

