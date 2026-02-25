/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
}

/** Standard API error */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
