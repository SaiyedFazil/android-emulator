/** Every successful API response. */
export interface ApiResponse<T> {
  message: string;
  data: T;
}

/** Every API error response. */
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  /** The business code (e.g. `AUTH_INVALID_CREDENTIALS`), or the HTTP status text. */
  error: string;
  details?: Record<string, unknown>;
}
