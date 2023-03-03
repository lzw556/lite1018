import { Menu, message } from 'antd';
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

export const CommandMenu = ({
  device,
  initialUpgradeCode
}: {
  device: Device;
  initialUpgradeCode?: number;
}) => {
  const { id, typeId, macAddress } = device;
  const { PubSub } = useSocket();
  const [upgradedCode, setUpgradeCode] = useState(initialUpgradeCode ?? device.upgradeStatus?.code);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [visibleCalibrate, setVisibleCalibrate] = useState(false);
  const { hasPermissions } = userPermission();

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
            message.success('取消升级成功').then();
          } else {
            message.error(`取消升级失败,${res.msg}`).then();
          }
        });
        break;
      case DeviceCommand.Calibrate:
        setVisibleCalibrate(true);
        break;
      default:
        SendDeviceCommandRequest(id, commandKey, channel ? { channel } : {}).then((res) => {
          if (res.code === 200) {
            message.success('发送成功').then();
          } else {
            message.error('发送失败').then();
          }
        });
        break;
    }
  };

  const upgrading = upgradedCode && IsUpgrading(upgradedCode);

  return (
    <Menu onClick={handelMenuClick} disabled={!device.state?.isOnline}>
      {!upgrading && (
        <>
          <Menu.Item key={DeviceCommand.Reboot}>重启</Menu.Item>
          {typeId !== DeviceType.Router && typeId !== DeviceType.Gateway && (
            <>
              <Menu.Item key={DeviceCommand.AcquireSensorData}>采集数据</Menu.Item>

              {typeId === DeviceType.BoltElongationMultiChannels ? (
                <Menu.SubMenu title='重置数据'>
                  <Menu.Item key={`[${DeviceCommand.ResetData},1]`}>1</Menu.Item>
                  <Menu.Item key={`[${DeviceCommand.ResetData},2]`}>2</Menu.Item>
                  <Menu.Item key={`[${DeviceCommand.ResetData},3]`}>3</Menu.Item>
                  <Menu.Item key={`[${DeviceCommand.ResetData},4]`}>4</Menu.Item>
                </Menu.SubMenu>
              ) : (
                <Menu.Item key={DeviceCommand.ResetData}>重置数据</Menu.Item>
              )}
            </>
          )}
          <Menu.Item key={DeviceCommand.Reset}>恢复出厂设置</Menu.Item>
          {(typeId === DeviceType.HighTemperatureCorrosion ||
            typeId === DeviceType.NormalTemperatureCorrosion ||
            typeId === DeviceType.BoltElongation ||
            typeId === DeviceType.BoltElongationMultiChannels ||
            typeId === DeviceType.PressureTemperature) && (
            <Menu.Item key={DeviceCommand.Calibrate}>校准</Menu.Item>
          )}
        </>
      )}
      {hasPermissions(Permission.DeviceUpgrade, Permission.DeviceFirmwares) && (
        <>
          <Menu.Item key={DeviceCommand.Upgrade} hidden={upgrading}>
            固件升级
          </Menu.Item>
          <Menu.Item key={DeviceCommand.CancelUpgrade} hidden={!upgrading}>
            取消升级
          </Menu.Item>
        </>
      )}
      {upgradeVisible && (
        <UpgradeModal
          visible={upgradeVisible}
          device={device}
          onSuccess={() => {
            setUpgradeVisible(false);
          }}
          onCancel={() => {
            setUpgradeVisible(false);
          }}
        />
      )}
      {visibleCalibrate && (
        <EditCalibrateParas
          visible={visibleCalibrate}
          setVisible={setVisibleCalibrate}
          typeId={typeId}
          properties={device.properties}
          onUpdate={(paras) => {
            setVisibleCalibrate(false);
            SendDeviceCommandRequest(typeId, DeviceCommand.Calibrate, paras).then((res) => {
              if (res.code === 200) {
                message.success('命令发送成功').then();
              } else {
                message.error(res.msg).then();
              }
            });
          }}
        />
      )}
    </Menu>
  );
};
