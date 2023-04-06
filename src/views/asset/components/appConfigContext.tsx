import { Spin } from 'antd';
import React from 'react';
import request from '../../../utils/request';

export type AppConfig = 'windTurbine' | 'general' | 'hydroTurbine' | 'corrosion';

const AppConfigContext = React.createContext<AppConfig>('windTurbine');

export const useAppConfigContext = () => React.useContext(AppConfigContext);

export function AppConfigProvider({ children }: { children?: JSX.Element }) {
  const [category, setCategory] = React.useState<AppConfig>();
  React.useEffect(() => {
    request
      .get<{ type: AppConfig }>('webConfig')
      .then((res) => {
        if (res.data.code === 200) {
          setCategory(res.data.data.type);
        } else {
          throw Error(`API: webConfig occur errors`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  if (category === undefined) return <Spin />;
  return <AppConfigContext.Provider value={category}>{children}</AppConfigContext.Provider>;
}
