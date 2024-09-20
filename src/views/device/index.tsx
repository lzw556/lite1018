import { Button, Empty, Spin } from 'antd';
import intl from 'react-intl-universal';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import './deviceList.css';
import { Device } from '../../types/device';
import { GetNetworkRequest, GetNetworksRequest } from '../../apis/network';
import { PageWithSideBar } from '../../components/pageWithSideBar';
import { DeviceTree } from './deviceTree';
import { SelfLink } from '../../components/selfLink';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteDeviceRequest } from '../../apis/device';

const DevicePage = () => {
  const { id: pathId } = useParams();
  const selectedKeys = pathId ? [pathId] : undefined;
  const devicesContext = useDevicesContext();
  const { devices, loading, setToken } = devicesContext;

  if (loading) return <Spin />;
  if (!loading && devices?.length === 0)
    return <Empty description={intl.get('NO_DATA')} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  if (!devices) return null;
  return (
    <>
      <PageWithSideBar
        content={
          pathId ? (
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
            <DeviceTree
              selectedKeys={selectedKeys}
              devices={devices}
              height={height}
              onConfirm={(key) => {
                DeleteDeviceRequest(Number(key));
                setToken((crt) => crt + 1);
              }}
            />
          ),
          head: (
            <SelfLink to='create'>
              <Button type='primary' size='small'>
                <PlusOutlined />
              </Button>
            </SelfLink>
          )
        }}
      />
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
          const rootDev = { id: 0, name: 'jjj', macAddress: '000000000000' } as Device;
          devs.push(rootDev);
          nets.forEach((net) =>
            devs.push(
              ...net.nodes.map((n) => {
                if (!n.parent || n.parent.length === 0) {
                  return { ...n, parent: rootDev.macAddress };
                } else {
                  return n;
                }
              })
            )
          );
          console.log(devs);
          setDevices(devs);
        })
        .finally(() => setLoading(false));
    });
  }, [token]);
  return { devices, loading, setDevices, token, setToken };
}
