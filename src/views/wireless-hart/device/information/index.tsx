import { Skeleton } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Device } from '../../../../types/device';
import useSocket, { SocketTopic } from '../../../../socket';
import { SingleDeviceDetail } from './SingleDeviceDetail';
import { Card } from '../../../../components';

export interface GatewayInformationProps {
  device: Device;
  isLoading: boolean;
}

const InformationCard: FC<GatewayInformationProps> = ({ device, isLoading }) => {
  const [upgradeStatus, setUpgradeStatus] = useState<any>(device.upgradeStatus);
  const { PubSub } = useSocket();

  useEffect(() => {
    PubSub.subscribe(SocketTopic.upgradeStatus, (msg: string, status: any) => {
      if (device.macAddress === status.macAddress) {
        console.log('upgradeStatus:', status);
        setUpgradeStatus({ code: status.code, progress: status.progress });
      }
    });
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
    };
  }, [PubSub, device.macAddress]);

  return (
    <Card>
      <Skeleton loading={isLoading}>
        <SingleDeviceDetail device={device} upgradeStatus={upgradeStatus} />
      </Skeleton>
    </Card>
  );
};

export default InformationCard;
