import {store} from "../store";


export const isLogin = (): boolean => {
    return store.getState().auth.data.token
}

export const getToken = (): string => {
    return store.getState().auth.data.token
}