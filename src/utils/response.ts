import { ResponseResult } from '../types/response';
import { message } from 'antd';
import { AxiosResponse } from 'axios';
import intl from 'react-intl-universal';

export function GetResponse<T>(response: AxiosResponse<ResponseResult<T>>) {
  return new Promise<T>((resolve, reject) => {
    if (response.data.code === 200) {
      resolve(response.data.data);
    } else {
      message.error(
        `${intl.get('FAILED_TO_GET_DATA')}${intl.get(response.data.msg).d(response.data.msg)}`
      );
      reject(response.data.msg);
    }
  });
}

export function PostResponse<T>(response: AxiosResponse<ResponseResult<T>>) {
  return new Promise<T>((resolve, reject) => {
    if (response.data.code === 200) {
      message.success(intl.get('CREATED_SUCCESSFUL'));
      resolve(response.data.data);
    } else {
      message.error(
        `${intl.get('FAILED_TO_CREATE')}${intl.get(response.data.msg).d(response.data.msg)}`
      );
      reject(response.data.msg);
    }
  });
}

export function PutResponse(response: AxiosResponse<ResponseResult<any>>) {
  return new Promise((resolve, reject) => {
    if (response.data.code === 200) {
      message.success(intl.get('UPDATED_SUCCESSFUL'));
      resolve(response.data.data);
    } else {
      message.error(
        `${intl.get('FAILED_TO_UPDATE')}${intl.get(response.data.msg).d(response.data.msg)}`
      );
      reject(response.data.msg);
    }
  });
}

export function HandlePutResponse<T>(response: AxiosResponse<ResponseResult<T>>) {
  return new Promise<T>((resolve, reject) => {
    if (response.data.code === 200) {
      resolve(response.data.data);
    } else {
      reject(response.data.msg);
    }
  });
}

export function DeleteResponse(response: AxiosResponse<ResponseResult<any>>) {
  return new Promise((resolve, reject) => {
    if (response.data.code === 200) {
      message.success(intl.get('DELETED_SUCCESSFUL'));
      resolve(response.data.data);
    } else {
      message.error(
        `${intl.get('FAILED_TO_DELETE')}${intl.get(response.data.msg).d(response.data.msg)}`
      );
      reject(response.data.msg);
    }
  });
}
