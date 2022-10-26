import { Col, Drawer, DrawerProps, Row, Typography } from 'antd';
import { Device } from '../../types/device';
import { FC, useState } from 'react';
import { RecentHistory } from './RecentHistory';

export interface DeviceMonitorDrawerProps extends DrawerProps {
  device: Device;
}

const DeviceMonitorDrawer: FC<DeviceMonitorDrawerProps> = (props) => {
  const { device } = props;
  const [height] = useState<number>(window.innerHeight);

  return (
    <Drawer
      {...props}
      placement={'top'}
      closable={false}
      height='auto'
      drawerStyle={{ maxHeight: '90vh' }}
    >
      <Row justify={'start'}>
        <Col span={24}>
          <Typography.Title level={4}>设备监控: {device.name}</Typography.Title>
          {/* {!isMobile && <Typography.Text>提示: 当前窗口显示14天内的监控数据, 按<Typography.Text keyboard>ESC</Typography.Text>可以退出此窗口</Typography.Text>} */}
        </Col>
      </Row>
      <br />
      <RecentHistory device={device} />
    </Drawer>
  );
};

export default DeviceMonitorDrawer;
