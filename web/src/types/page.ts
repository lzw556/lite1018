export type PageResult<T> = {
  page: number;
  size: number;
  total: number;
  result: T;
};
