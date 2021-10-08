import {combineReducers} from 'redux';
import userLogin from './user'
import storage from "redux-persist/lib/storage";
import {persistReducer} from "redux-persist";

export interface State<T> {
    data: T
}

const authPersistConfig = {
    key: 'auth',
    storage: storage,
}

export default combineReducers({
    auth: persistReducer(authPersistConfig, userLogin)
})