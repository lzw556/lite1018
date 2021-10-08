import axios, {AxiosRequestConfig, AxiosResponse, Method} from "axios";
import {ResponseResult} from "../types/response";
import {getToken, isLogin} from "./session";

axios.defaults.timeout = 10000
axios.defaults.baseURL = "http://localhost:8080/api"

axios.interceptors.request.use((config:AxiosRequestConfig) => {
    if (isLogin()) {
        config.headers.Authorization = `Bearer ${getToken()}`
    }
    return config
})

axios.interceptors.response.use(<T>(response:AxiosResponse<T>) => {
    if (response.status === 200) {
        return response
    }
    return response
}, error => {
    window.location.hash = '/500'
})


function request<T>(method: Method, url: string, params: any) {
    if (params) {
        params = filterNull(params)
    }
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
        axios.request({
            url: url,
            data: method === "POST" || method === "PUT" || method === "PATCH" ? params: null,
            params: method === "GET" ? params: null,
            method: method,
        }).then(res => resolve(res))
            .catch(error => reject(error))
    })
}

function download<T>(method: Method, url: string, params: any) {
    if (params) {
        params = filterNull(params)
    }
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
        axios.request({
            url: url,
            data: method === "POST" || method === "PUT" || method === "PATCH" ? params: null,
            params: method === "GET" ? params: null,
            method: method,
            responseType: 'blob'
        }).then(res => resolve(res))
            .catch(error => reject(error))
    })
}

function typeOf(t:any) {
    const matcher = ({}).toString.call(t).match(/\s([a-zA-Z]+)/)
    if (matcher && matcher.length >= 2) {
        return matcher[1].toLowerCase()
    }
}

function filterNull(params:any) {
    Object.keys(params).map(key => {
        if (params[key] === null) {
            delete params[key]
        }
        if (typeOf(params[key]) === 'string') {
            params[key] = params[key].trim()
        }else if (typeOf(params[key] === 'object')){
            params[key] = filterNull(params[key])
        }else if (typeOf(params[key] === 'array')) {
            params[key] = filterNull(params[key])
        }
    })
    return params
}

// eslint-disable-next-line
export default {
    download: <T>(url:string, params: any = null) => {
        return download<T>('GET', url, params)
    },
    get: <T>(url: string, params: any = null) => {
        return request<ResponseResult<T>>('GET', url, params)
    },
    post: <T>(url: string, params: any) => {
        return request<ResponseResult<T>>('POST', url, params)
    },
    put: <T>(url: string, params: any) => {
        return request<ResponseResult<T>>('PUT', url, params)
    },
    patch: <T>(url: string, params: any) => {
        return request<ResponseResult<T>>('PATCH', url, params)
    },
    delete: <T>(url: string, params: any = null) => {
        return request<ResponseResult<T>>('DELETE', url, params)
    }
}