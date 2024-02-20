import { Empty, Spin } from 'antd';
import intl from 'react-intl-universal';
import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import './deviceList.css';
import { Device } from '../../types/device';
import { GetNetworkRequest, GetNetworksRequest } from '../../apis/network';
import { DeviceSidebar } from './deviceSidebar';

const DevicePage = () => {
  const { id } = useParams();
  const [path, setPath] = React.useState<string[] | undefined>(id ? [id] : undefined);
  const location = useLocation();
  const devicesContext = useDevicesContext();
  const { devices, loading } = devicesContext;

  if (loading) return <Spin />;
  if (!loading && devices?.length === 0)
    return <Empty description={intl.get('NO_DATA')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  if (!devices) return null;
  return (
    <>
      <DeviceSidebar {...devicesContext} path={path} setPath={setPath} />
      <div className='device-detail'>
        {path && path.length > 0 && location.pathname !== '/devices' ? (
          <Outlet key={path[0]} />
        ) : (
          <Empty
            description={intl.get('PLEASE_SELECT_AN_DEVICE')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </>
  );
};

export default DevicePage;

export type DevicesContextProps = {
  devices: Device[] | undefined;
  loading: boolean;
  setToken: React.Dispatch<React.SetStateAction<number>>;
  token: number;
};

export const DevicesContext = React.createContext<DevicesContextProps>({
  devices: [],
  loading: false,
  token: 0,
  setToken: () => {}
});

export const DevicesContextProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useDevices();
  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
};

export const useDevicesContext = () => {
  return React.useContext(DevicesContext);
};

function useDevices() {
  const [token, setToken] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [devices, setDevices] = React.useState<Device[] | undefined>();
  React.useEffect(() => {
    setLoading(true);
    GetNetworksRequest().then((nets) => {
      const fetchs = nets.map((net) => GetNetworkRequest(net.id));
      Promise.all(fetchs)
        .then((nets) => {
          const devs: Device[] = [];
          nets.forEach((net) => devs.push(...net.nodes));
          setDevices(devs);
        })
        .finally(() => setLoading(false));
    });
  }, [token]);
  return { devices, loading, setDevices, token, setToken };
}
