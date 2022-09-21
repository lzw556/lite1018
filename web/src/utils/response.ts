import {ResponseResult} from "../types/response";
import {message} from "antd";
import {AxiosResponse} from "axios";


export function GetResponse<T>(response:AxiosResponse<ResponseResult<T>>) {
    return new Promise<T>((resolve, reject) => {
        if (response.data.code === 200) {
            resolve(response.data.data);
        } else {
            message.error(`获取数据失败：${response.data.msg}`);
            reject(response.data.msg);
        }
    });
}

export function PostResponse<T>(response:AxiosResponse<ResponseResult<T>>) {
    return new Promise<T>((resolve, reject) => {
        if (response.data.code === 200) {
            message.success("添加成功")
            resolve(response.data.data);
        } else {
            message.error(`添加失败：${response.data.msg}`)
            reject(response.data.msg);
        }
    });
}

export function PutResponse(response:AxiosResponse<ResponseResult<any>>) {
    return new Promise((resolve, reject) => {
        if (response.data.code === 200) {
            message.success("编辑成功")
            resolve(response.data.data);
        } else {
            message.error(`编辑失败：${response.data.msg}`)
            reject(response.data.msg);
        }
    });
}

export function DeleteResponse(response:AxiosResponse<ResponseResult<any>>) {
    return new Promise((resolve, reject) => {
        if (response.data.code === 200) {
            message.success("删除成功")
            resolve(response.data.data);
        } else {
            message.error(`删除失败：${response.data.msg}`)
            reject(response.data.msg);
        }
    });
}