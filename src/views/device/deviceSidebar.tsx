import React from 'react';
import { Button, Drawer } from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { DevicesContextProps } from '.';
import { DeviceTree } from './deviceTree';
import { DeleteDeviceRequest } from '../../apis/device';
import { SelfLink } from '../../components/selfLink';
import { isMobile } from '../../utils/deviceDetection';

export const DeviceSidebar = ({
  devices,
  loading,
  setToken,
  path,
  setPath
}: DevicesContextProps & {
  path: string[] | undefined;
  setPath: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}) => {
  const [treeHeight, setTreeHeight] = React.useState(780);
  const [open, setOpen] = React.useState(false);
  const deviceSidebarRef = React.useRef<HTMLDivElement>(null);
  const onDelete = (id: string) => {
    DeleteDeviceRequest(Number(id));
  };

  React.useEffect(() => {
    const setHeight = () => {
      if (deviceSidebarRef && deviceSidebarRef.current) {
        const height = Number(getComputedStyle(deviceSidebarRef.current).height.replace('px', ''));
        setTreeHeight(height - 40);
      }
    };
    if (devices && devices?.length > 0 && loading === false) {
      setHeight();
      window.addEventListener('resize', setHeight);
      return () => {
        window.removeEventListener('resize', setHeight);
      };
    }
  }, [devices, loading, deviceSidebarRef]);

  const side = devices ? (
    <div className='device-sidebar' ref={deviceSidebarRef}>
      <div className='device-tree' style={{ height: treeHeight }}>
        <DeviceTree
          selectedKeys={path}
          devices={devices}
          height={treeHeight}
          onSelect={(keys) => setPath(keys)}
          onConfirm={(key) => {
            onDelete(key);
            setToken((crt) => crt + 1);
            setPath(undefined);
          }}
        />
      </div>
      <div className='device-actions'>
        <SelfLink to='create'>
          <Button type='primary'>
            <PlusOutlined />
          </Button>
        </SelfLink>
      </div>
    </div>
  ) : null;

  return isMobile ? (
    <>
      <EllipsisOutlined onClick={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)} onClick={() => setOpen(false)}>
        {side}
      </Drawer>
    </>
  ) : (
    side
  );
};
