import reducer from './reducers';
import { createStore, Store } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['auth']
};

function makeStore(): Store<any, any> {
  return createStore(persistReducer(persistConfig, reducer));
}

export const store = makeStore();

export const persistor = persistStore(store);
