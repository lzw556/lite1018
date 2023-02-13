import ReactDOM from 'react-dom';
import { persistor, store } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { StoreContext } from 'redux-react-hook';
import AppRouter from './routers';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { ConfigProvider } from 'antd';
import request from './utils/request';

moment.locale('zh-cn');
request.get<{ type: 'general' | 'windTurbine' | 'vibration' }>('webConfig').then((res) => {
  if (res.data.code === 200) {
    if (res.data.data.type === 'windTurbine') window.assetCategory = 'wind';
  }
});
// window.assetCategory = 'wind';
ReactDOM.render(
  <StoreContext.Provider value={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConfigProvider locale={zhCN}>
        <AppRouter />
      </ConfigProvider>
    </PersistGate>
  </StoreContext.Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
