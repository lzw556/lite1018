import {combineReducers} from 'redux';
import userLogin from './user'
import storage from "redux-persist/lib/storage";
import {persistReducer} from "redux-persist";
import getMenus from "./menu";
import setProject from "./project";
import setPermission from "./permission";
import pageReducer from "./page";
import deviceFilterReducer from "./deviceFIlter";

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

const projectPersistConfig = {
    key: 'project',
    storage: storage,
}

const permissionPersistConfig = {
    key: 'permission',
    storage: storage,
}

const pagePersistConfig = {
    key: 'page',
    storage: storage,
}

const deviceFilterPersistConfig = {
    key: "deviceFilter",
    storage: storage,
}

export default combineReducers({
    auth: persistReducer(authPersistConfig, userLogin),
    menu: persistReducer(menuPersistConfig, getMenus),
    project: persistReducer(projectPersistConfig, setProject),
    permission: persistReducer(permissionPersistConfig, setPermission),
    page: persistReducer(pagePersistConfig, pageReducer),
    deviceFilter: persistReducer(deviceFilterPersistConfig, deviceFilterReducer)
})