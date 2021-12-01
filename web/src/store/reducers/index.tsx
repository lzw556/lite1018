import {combineReducers} from 'redux';
import userLogin from './user'
import storage from "redux-persist/lib/storage";
import {persistReducer} from "redux-persist";
import getMenus from "./menu";

export interface State<T> {
    data: T
}

const authPersistConfig = {
    key: 'auth',
    storage: storage,
}

const menuPersistConfig = {
    key: 'menu',
    storage: storage,
}

export default combineReducers({
    auth: persistReducer(authPersistConfig, userLogin),
    menu: persistReducer(menuPersistConfig, getMenus)
})