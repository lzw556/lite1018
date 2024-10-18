import ReactDOM from 'react-dom';
import { persistor, store } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { StoreContext } from 'redux-react-hook';
import AppRouter from './routers';
import { LocaleProvider } from './localeProvider';
import { AppProvider } from './config';

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <PersistGate loading={null} persistor={persistor}>
      <LocaleProvider>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </LocaleProvider>
    </PersistGate>
  </StoreContext.Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
