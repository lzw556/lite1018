import { Empty, Spin } from 'antd';
import intl from 'react-intl-universal';
import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import './deviceList.css';
import { Device } from '../../types/device';
import { GetNetworkRequest, GetNetworksRequest } from '../../apis/network';
import { PageWithSideBar } from '../../components/pageWithSideBar';
import { DeviceTree } from './deviceTree';
import { DeleteDeviceRequest } from '../../apis/device';
import { VIRTUAL_ROOT_DEVICE } from '../../constants';

const DevicePage = () => {
  const { pathname } = useLocation();
  const { id: pathId } = useParams();
  const selectedKeys = pathId ? [pathId] : undefined;
  const devicesContext = useDevicesContext();
  const { devices, loading, setToken } = devicesContext;
  if (!loading && devices?.length === 0)
    return <Empty description={intl.get('NO_DATA')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  if (!devices) return null;

  return (
    <PageWithSideBar
      content={
        pathId || pathname !== '/devices' ? (
          <Outlet key={pathId} />
        ) : (
          <Empty
            description={intl.get('PLEASE_SELECT_AN_DEVICE')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
      }
      sideBar={{
        body: (height) => (
          <Spin spinning={loading}>
            <DeviceTree
              selectedKeys={selectedKeys}
              devices={devices}
              height={height}
              onConfirm={(key) => {
                DeleteDeviceRequest(Number(key)).then(() => setToken((crt) => crt + 1));
              }}
            />
          </Spin>
        )
      }}
    />
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
          devs.push(VIRTUAL_ROOT_DEVICE as Device);
          nets.forEach((net) =>
            devs.push(
              ...net.nodes.map((n) => {
                if (!n.parent || n.parent.length === 0) {
                  return { ...n, parent: VIRTUAL_ROOT_DEVICE.macAddress };
                } else {
                  return n;
                }
              })
            )
          );
          setDevices(devs);
        })
        .finally(() => setLoading(false));
    });
  }, [token]);
  return { devices, loading, setDevices, token, setToken };
}
