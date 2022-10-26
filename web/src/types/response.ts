export type ResponseResult<T> = {
  code: number;
  msg: string;
  data: T;
};
