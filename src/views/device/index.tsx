import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import './deviceList.css';
import { Device } from '../../types/device';
import { GetNetworkRequest } from '../../apis/network';
import { PageWithSideBar } from '../../components/pageWithSideBar';
import { DeviceTree } from './deviceTree';
import { getProject } from '../../utils/session';
import { GetDeviceRequest, GetDevicesRequest } from '../../apis/device';
import { DeviceType } from '../../types/device_type';
import { Network } from '../../types/network';
import { Virtual } from './virtual';

export const VIRTUAL_ROOT_DEVICE = {
  macAddress: '000000000000',
  id: 0,
  name: getProject().name
};

const virtualPathId = `${VIRTUAL_ROOT_DEVICE.id}`;

const DevicePage = () => {
  const { pathname } = useLocation();
  const isRouteCreateOrImport = pathname === '/devices/create' || pathname === '/devices/import';
  const { id: pathId = virtualPathId } = useParams();

  return (
    <ContextProvider>
      <PageWithSideBar
        content={
          pathId === virtualPathId && !isRouteCreateOrImport ? <Virtual /> : <Outlet key={pathId} />
        }
        sideBar={{
          body: (height) => <DeviceTree selectedKeys={[pathId]} height={height} />
        }}
      />
    </ContextProvider>
  );
};

export default DevicePage;

type ContextProps = {
  devices: Device[];
  devicesLoading: boolean;
  loading: boolean;
  refresh: (flag?: boolean) => void;
  device: Device | undefined;
  network: Network | undefined;
};

const Context = React.createContext<ContextProps>({
  devices: [],
  devicesLoading: false,
  loading: false,
  refresh: () => {},
  device: undefined,
  network: undefined
});

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { id: pathId = virtualPathId } = useParams();
  const id = Number(pathId);
  const [devicesLoading, setDeviceLoading] = React.useState(false);
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [device, setDevice] = React.useState<Device | undefined>();
  const [network, setNetwork] = React.useState<Network | undefined>();

  const fetchDevices = () => {
    setDeviceLoading(true);

    GetDevicesRequest({})
      .then(setDevices)
      .finally(() => setDeviceLoading(false));
  };

  React.useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevice = React.useCallback((id: number) => {
    setLoading(true);
    GetDeviceRequest(Number(id))
      .then((data) => {
        setDevice(data);
        if (DeviceType.isGateway(data.typeId)) {
          if (data.network?.id) {
            GetNetworkRequest(data.network?.id).then((data) => {
              setNetwork(data);
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!Number.isNaN(id) && id > 0) {
      fetchDevice(id);
    }
  }, [id, fetchDevice]);

  const refresh = React.useCallback(
    (flag?: boolean) => {
      if (flag) {
        fetchDevices();
      } else {
        fetchDevice(id);
      }
    },
    [id, fetchDevice]
  );

  return (
    <Context.Provider value={{ devices, devicesLoading, device, loading, refresh, network }}>
      {children}
    </Context.Provider>
  );
};

export const useContext = () => {
  return React.useContext(Context);
};
