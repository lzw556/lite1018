import { Spin } from 'antd';
import React from 'react';
import request from '../../../utils/request';

export type AppConfigType =
  | 'windTurbine'
  | 'general'
  | 'hydroTurbine'
  | 'corrosion'
  | 'corrosionWirelessHART'
  | 'windTurbinePro'
  | 'vibration';

export type AppConfig = { type: AppConfigType; analysisEnabled?: boolean };

const AppConfigContext = React.createContext<AppConfig>({ type: 'windTurbine' });

export const useAppConfigContext = () => React.useContext(AppConfigContext);

export function AppConfigProvider({ children }: { children?: JSX.Element }) {
  const [config, setConfig] = React.useState<AppConfig>();
  React.useEffect(() => {
    request
      .get<AppConfig>('webConfig')
      .then((res) => {
        if (res.data.code === 200) {
          setConfig(res.data.data);
        } else {
          throw Error(`API: webConfig occur errors`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  if (config === undefined) return <Spin />;
  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}
