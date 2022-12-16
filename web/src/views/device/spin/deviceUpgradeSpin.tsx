import { Progress, Space, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { FC } from 'react';
import { DeviceUpgradeStatus } from '../../../types/device_upgrade_status';

export interface DeviceUpgradeSpinProps {
  status: any;
}

const DeviceUpgradeSpin: FC<DeviceUpgradeSpinProps> = ({ status }) => {
  const render = () => {
    const DOWNLOAD_COMPLETE_TEXT = '固件下载完成, 待升级';
    switch (status.code) {
      case DeviceUpgradeStatus.Pending:
        return (
          <>
            <Spin size={'small'} indicator={<LoadingOutlined />} spinning={true} />
            <Text strong style={{ fontSize: '9pt', color: '#8a8e99' }}>
              连接中
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Loading:
        const progressValue = status.progress.toFixed(0);
        const progressText =
          Number(progressValue) === 100 ? DOWNLOAD_COMPLETE_TEXT : `固件下载中${progressValue}%`;
        return (
          <>
            <Progress
              type='circle'
              showInfo={false}
              percent={status.progress}
              strokeWidth={12}
              width={16}
            />
            <Text
              strong
              style={{
                fontSize: '9pt',
                color: '#8a8e99'
              }}
            >
              {progressText}
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Upgrading:
        return (
          <>
            <Progress
              type='circle'
              showInfo={false}
              percent={status.progress}
              strokeWidth={12}
              width={16}
            />
            <Text
              style={{
                fontSize: '9pt',
                color: '#8a8e99'
              }}
            >{`升级中${status.progress.toFixed(0)}%`}</Text>
          </>
        );
      case DeviceUpgradeStatus.Cancelled:
        return (
          <>
            <Progress
              type='circle'
              showInfo={false}
              percent={status.progress}
              strokeWidth={12}
              width={16}
            />
            <Text
              style={{
                fontSize: '9pt'
              }}
              type={'warning'}
            >
              升级已取消
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Error:
        return (
          <>
            <Progress
              type='circle'
              showInfo={false}
              percent={status.progress}
              strokeWidth={12}
              width={16}
              status={'exception'}
            />
            <Text style={{ fontSize: '9pt' }} type={'danger'}>
              升级失败
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Success:
        return (
          <>
            <Progress type='circle' percent={status.progress} strokeWidth={12} width={16} />
            <Text style={{ fontSize: '9pt' }} type={'success'}>
              升级成功
            </Text>
          </>
        );
    }
    return <></>;
  };

  return <Space>{render()}</Space>;
};

export default DeviceUpgradeSpin;
