import { Progress, Space, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Text from 'antd/es/typography/Text';
import { FC } from 'react';
import { DeviceUpgradeStatus } from '../../../types/device_upgrade_status';
import intl from 'react-intl-universal';

export interface DeviceUpgradeSpinProps {
  status: any;
}

const DeviceUpgradeSpin: FC<DeviceUpgradeSpinProps> = ({ status }) => {
  const style = { fontSize: 12, fontWeight: 400 };
  const render = () => {
    const DOWNLOAD_COMPLETE_TEXT = intl.get('FIRMWARE_DOWNLOADING_FINISHED_PROMPT');
    switch (status.code) {
      case DeviceUpgradeStatus.Pending:
        return (
          <>
            <Spin size={'small'} indicator={<LoadingOutlined />} spinning={true} />
            <Text strong style={{ ...style, color: '#8a8e99' }}>
              {intl.get('CONNECTING')}
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Loading:
        const progressValue = status.progress.toFixed(0);
        const progressText =
          Number(progressValue) === 100
            ? DOWNLOAD_COMPLETE_TEXT
            : intl.get('FIRMWARE_DOWNLOADING_WITH_PROGRESS', { progress: progressValue });
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
                ...style,
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
                ...style,
                color: '#8a8e99'
              }}
            >
              {intl.get('UPGRADING_WITH_PROGRESS', { progress: status.progress.toFixed(0) })}
            </Text>
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
            <Text style={style} type={'warning'}>
              {intl.get('UPGRADING_IS_CANCELLED')}
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
            <Text style={style} type={'danger'}>
              {intl.get('UPGRADE_FIRMWARE_SUCCESSFUL')}
            </Text>
          </>
        );
      case DeviceUpgradeStatus.Success:
        return (
          <>
            <Progress type='circle' percent={status.progress} strokeWidth={12} width={16} />
            <Text style={style} type={'success'}>
              {intl.get('FAILED_TO_UPGRADE_FIRMWARE')}
            </Text>
          </>
        );
    }
    return <></>;
  };

  return <Space>{render()}</Space>;
};

export default DeviceUpgradeSpin;
