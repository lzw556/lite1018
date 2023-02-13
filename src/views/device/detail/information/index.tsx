import { Skeleton } from 'antd';
import { FC, useEffect, useState } from 'react';
import { Device } from '../../../../types/device';
import '../../index.css';
import ShadowCard from '../../../../components/shadowCard';
import '../../../../string-extension';
import useSocket, { SocketTopic } from '../../../../socket';
import { SingleDeviceDetail } from './SingleDeviceDetail';

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
        setUpgradeStatus({ code: status.code, progress: status.progress });
      }
    });
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
    };
  }, []);

  return (
    <ShadowCard>
      <Skeleton loading={isLoading}>
        <SingleDeviceDetail device={device} upgradeStatus={upgradeStatus} />
      </Skeleton>
    </ShadowCard>
  );
};

export default InformationCard;
