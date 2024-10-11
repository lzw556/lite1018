import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { ResponseResult } from '../types/response';
import { getProject, getToken, isLogin } from './session';
import { message } from 'antd';
import dayjs from '../utils/dayjsUtils';

axios.defaults.timeout = 30 * 1000;
axios.defaults.baseURL = '/api';

axios.interceptors.request.use((config: AxiosRequestConfig) => {
  if (isLogin()) {
    config.headers.Authorization = `Bearer ${getToken()}`;
    config.headers.Project = getProject().id;
    config.headers.Timezone = dayjs.tz.guess();
  }
  return config;
});

axios.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => {
    if (response.status === 200) {
      return response;
    }
    return response;
  },
  (error) => {
    const { status } = error.response;
    switch (status) {
      case 403:
        window.location.hash = '/403';
        break;
      case 404:
        window.location.hash = '/404';
        break;
      case 500:
        window.location.hash = '/500';
        break;
      case 400:
        message.error(`${error.response.data.msg}`);
        break;
      default:
        break;
    }
    return Promise.reject(error);
  }
);

function request<T>(method: Method, url: string, params: any) {
  if (params) {
    params = filterNull(params);
  }
  return new Promise<AxiosResponse<T>>((resolve, reject) => {
    axios
      .request({
        url: url,
        data:
          method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
            ? params
            : null,
        params: method === 'GET' ? params : null,
        method: method
      })
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
}

function download<T>(method: Method, url: string, params: any) {
  if (params) {
    params = filterNull(params);
  }
  return new Promise<AxiosResponse<T>>((resolve, reject) => {
    axios
      .request({
        url: url,
        data: method === 'POST' || method === 'PUT' || method === 'PATCH' ? params : null,
        params: method === 'GET' ? params : null,
        method: method,
        responseType: 'blob'
      })
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
}

function upload<T>(url: string, params: any) {
  if (params) {
    params = filterNull(params);
  }
  return new Promise<AxiosResponse<T>>((resolve, reject) => {
    axios
      .request({
        url: url,
        data: params,
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
}

function typeOf(t: any) {
  const matcher = {}.toString.call(t).match(/\s([a-zA-Z]+)/);
  if (matcher && matcher.length >= 2) {
    return matcher[1].toLowerCase();
  }
}

function filterNull(params: any) {
  Object.keys(params).forEach((key) => {
    if (params[key] === null) {
      delete params[key];
    } else if (typeOf(params[key]) === 'string') {
      params[key] = params[key].trim();
    } else if (typeOf(params[key] === 'object')) {
      params[key] = filterNull(params[key]);
    } else if (typeOf(params[key] === 'array')) {
      params[key] = filterNull(params[key]);
    }
  });
  return params;
}

// eslint-disable-next-line
export default {
  download: <T>(url: string, params: any = null) => {
    return download<T>('GET', url, params);
  },
  upload: <T>(url: string, params: any) => {
    return upload<ResponseResult<T>>(url, params);
  },
  get: <T>(url: string, params: any = null) => {
    return request<ResponseResult<T>>('GET', url, params);
  },
  post: <T>(url: string, params: any) => {
    return request<ResponseResult<T>>('POST', url, params);
  },
  put: <T>(url: string, params: any) => {
    return request<ResponseResult<T>>('PUT', url, params);
  },
  patch: <T>(url: string, params: any) => {
    return request<ResponseResult<T>>('PATCH', url, params);
  },
  delete: <T>(url: string, params: any = null) => {
    return request<ResponseResult<T>>('DELETE', url, params);
  }
};
