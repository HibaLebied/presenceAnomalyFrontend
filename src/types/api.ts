export type ApiError = {
  timestamp: string;
  requestId?: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
};

export type PageMetadata = {
  page: number;
  size: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type PageResponse<TItem> = {
  content: TItem[];
  page: PageMetadata;
};
