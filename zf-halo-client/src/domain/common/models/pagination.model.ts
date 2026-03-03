export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
