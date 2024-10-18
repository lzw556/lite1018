import React from 'react';
import { Badge, Button, Popconfirm, Spin, Tree } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { useNavigate } from 'react-router-dom';
import { Device } from '../../types/device';
import { useContext, VIRTUAL_ROOT_DEVICE } from '.';
import { DeleteDeviceRequest } from '../../apis/device';
import { DeviceNS } from './util';
import { BasicDataNode } from 'antd/es/tree';
import { DeviceType } from '../../types/device_type';
import { DeleteNetworkRequest } from '../../apis/network';

export const DeviceTree = ({
  selectedKeys,
  height
}: {
  selectedKeys?: string[];
  height: number;
}) => {
  const navigate = useNavigate();
  const { device, devicesLoading, refresh } = useContext();
  const [selectedKey, setSelectedKey] = React.useState<string | undefined>(
    selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : undefined
  );

  const treeData = useDeviceTreeData();
  return (
    <Spin spinning={devicesLoading}>
      {!devicesLoading && (
        <Tree
          defaultExpandAll={true}
          selectedKeys={selectedKeys}
          showIcon={true}
          treeData={treeData}
          titleRender={(node) => {
            return node.key !== VIRTUAL_ROOT_DEVICE.id.toString() ? (
              <>
                <Badge
                  status={node.state && node.state.isOnline ? 'success' : 'default'}
                  text={node.title}
                />
                {selectedKey && selectedKey === node.key && (
                  <Popconfirm
                    title={intl.get('DELETE_SOMETHING_PROMPT', { something: node.title })}
                    onConfirm={() => {
                      if (device) {
                        if (DeviceType.isGateway(device.typeId) && device.network) {
                          DeleteNetworkRequest(device.network.id).then(() => {
                            refresh(true);
                            navigate(`/devices/0`);
                          });
                        } else {
                          DeleteDeviceRequest(device.id).then(() => {
                            refresh(true);
                            navigate(`/devices/0`);
                          });
                        }
                      }
                    }}
                  >
                    <Button type='text' danger={true} size='small'>
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                )}
              </>
            ) : (
              node.title
            );
          }}
          height={height}
          onSelect={(keys, e: any) => {
            const id = `${e.node.key}`;
            setSelectedKey(id);
            navigate(`/devices/${id}`);
          }}
        />
      )}
    </Spin>
  );
};

export function useDeviceTreeData() {
  const { devices } = useContext();
  const devs: Device[] = [VIRTUAL_ROOT_DEVICE as Device];
  if (devices.length > 0) {
    devs.push(
      ...devices.map((d) => {
        if (DeviceNS.Assert.isRoot(d)) {
          return { ...d, parent: VIRTUAL_ROOT_DEVICE.macAddress };
        } else {
          return d;
        }
      })
    );
  }
  return buildDeviceTreeData(devs);
}

export type DeviceTreeNode = Device & {
  key: string;
  title: React.ReactNode;
  children: Device[];
} & BasicDataNode;

function buildDeviceTreeData(devices: Device[]): DeviceTreeNode[] {
  const nodes: DeviceTreeNode[] = [];
  devices.forEach((dev) => {
    if (dev.macAddress === VIRTUAL_ROOT_DEVICE.macAddress) {
      const { name, id, children } = getDeviceWithChildren(dev, devices);
      nodes.push({
        ...dev,
        title: name,
        key: `${id}`,
        children
      });
    }
  });
  return nodes;
}

function getDeviceWithChildren(dev: Device, devices: Device[]): DeviceTreeNode {
  const children = devices.filter((d) => d.parent === dev.macAddress);
  return {
    ...dev,
    title: dev.name,
    key: `${dev.id}`,
    children: children.map((d) => getDeviceWithChildren(d, devices))
  };
}
