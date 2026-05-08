interface ApiResonseMeta {
  status_code: number;
  success: boolean;
  message: string;
}

export interface ApiResponse<T = unknown> {
  meta: ApiResonseMeta;
  data: T;
}
