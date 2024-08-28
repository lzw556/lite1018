import { Button, Dropdown, MenuProps, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { DeviceCommand } from '../../types/device_command';
import userPermission, { Permission } from '../../permission/permission';
import { DeviceType } from '../../types/device_type';
import { DeviceUpgradeRequest, SendDeviceCommandRequest } from '../../apis/device';
import UpgradeModal from './upgrade';
import EditCalibrateParas from './edit/editCalibrateParas';
import { Device } from '../../types/device';
import useSocket, { SocketTopic } from '../../socket';
import { IsUpgrading } from '../../types/device_upgrade_status';
import intl from 'react-intl-universal';
import { DownOutlined } from '@ant-design/icons';
import { isMobile } from '../../utils/deviceDetection';
import { useAppConfigContext } from '../asset';

export const CommandDropdown = ({
  device,
  target,
  initialUpgradeCode
}: {
  device: Device;
  target?: JSX.Element;
  initialUpgradeCode?: number;
}) => {
  const config = useAppConfigContext();
  const { id, typeId, macAddress } = device;
  const { PubSub } = useSocket();
  const [upgradedCode, setUpgradeCode] = useState(initialUpgradeCode ?? device.upgradeStatus?.code);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [openCalibrate, setVisibleCalibrate] = useState(false);
  const { hasPermissions } = userPermission();
  const chanels = DeviceType.isMultiChannel(typeId, true);

  useEffect(() => {
    PubSub.subscribe(SocketTopic.upgradeStatus, (msg: string, status: any) => {
      if (macAddress === status.macAddress) {
        setUpgradeCode(status.code);
      }
    });
    return () => {
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
      PubSub.unsubscribe(SocketTopic.connectionState);
    };
  }, [PubSub, macAddress]);

  const handelMenuClick = ({ key }: any) => {
    let commandKey = Number(key);
    let channel = undefined;
    if (Number.isNaN(commandKey)) {
      try {
        const commands: [number, number] = JSON.parse(key);
        commandKey = commands[0];
        channel = commands[1];
      } catch (error) {}
    }
    switch (commandKey) {
      case DeviceCommand.Upgrade:
        setUpgradeVisible(true);
        break;
      case DeviceCommand.CancelUpgrade:
        DeviceUpgradeRequest(id, { type: DeviceCommand.CancelUpgrade }).then((res) => {
          if (res.code === 200) {
            message.success(intl.get('CANCEL_UPGRADING_SUCCESSFUL')).then();
          } else {
            message.error(`${intl.get('FAILED_TO_CANCEL_UPGRADING')},${res.msg}`).then();
          }
        });
        break;
      case DeviceCommand.Calibrate:
        setVisibleCalibrate(true);
        break;
      default:
        SendDeviceCommandRequest(id, commandKey, channel ? { channel } : {}).then((res) => {
          if (res.code === 200) {
            message.success(intl.get('SENT_SUCCESSFUL')).then();
          } else {
            message.error(intl.get('FAILED_TO_SEND')).then();
          }
        });
        break;
    }
  };

  const upgrading = upgradedCode && IsUpgrading(upgradedCode);

  type MenuItem = Required<MenuProps>['items'][number];
  const items: MenuProps['items'] = [];

  if (!upgrading) {
    items.push({ key: DeviceCommand.Reboot, label: intl.get('RESTART') });
    if (DeviceType.isSensor(typeId)) {
      items.push({ key: DeviceCommand.AcquireSensorData, label: intl.get('ACQUIRE_SENSOR_DATA') });
      const resetItem: MenuItem = { key: DeviceCommand.ResetData, label: intl.get('RESET_DATA') };
      if (chanels.length > 0) {
        items.push({
          ...resetItem,
          children: chanels.map((c) => ({
            key: `[${DeviceCommand.ResetData},${c.value}]`,
            label: c.label
          }))
        });
      } else {
        items.push(resetItem);
      }
    }
    items.push({ key: DeviceCommand.Reset, label: intl.get('RESTORE_FACTORY_SETTINGS') });
    if (DeviceType.canSupportingCalibrate(typeId)) {
      items.push({ key: DeviceCommand.Calibrate, label: intl.get('CALIBRATE') });
    }
  }
  if (hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares)) {
    if (!upgrading) {
      if (config.type !== 'corrosionWirelessHART') {
        items.push({ key: DeviceCommand.Upgrade, label: intl.get('UPGRADE_FIRMWARE') });
      }
    } else {
      items.push({
        key: DeviceCommand.CancelUpgrade,
        label: intl.get('CANCEL_UPGRADING_FIRMWARE')
      });
    }
  }

  return (
    <>
      <Dropdown
        menu={{ items, onClick: handelMenuClick, disabled: !device.state?.isOnline }}
        trigger={isMobile ? ['click'] : ['hover']}
      >
        {target ?? (
          <Button type={'primary'}>
            {intl.get('DEVICE_COMMANDS')}
            <DownOutlined />
          </Button>
        )}
      </Dropdown>
      {upgradeVisible && (
        <UpgradeModal
          open={upgradeVisible}
          device={device}
          onSuccess={() => {
            setUpgradeVisible(false);
          }}
          onCancel={() => {
            setUpgradeVisible(false);
          }}
        />
      )}
      {openCalibrate && (
        <EditCalibrateParas
          open={openCalibrate}
          setVisible={setVisibleCalibrate}
          typeId={typeId}
          properties={device.properties}
          onUpdate={(paras) => {
            setVisibleCalibrate(false);
            SendDeviceCommandRequest(id, DeviceCommand.Calibrate, paras).then((res) => {
              if (res.code === 200) {
                message.success(intl.get('COMMAND_SENT_SUCCESSFUL')).then();
              } else {
                message.error(intl.get(res.msg).d(res.msg)).then();
              }
            });
          }}
        />
      )}
    </>
  );
};
