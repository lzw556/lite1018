import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Device } from '../../types/device';
import { Badge, Button, Popconfirm, Tree, TreeDataNode } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { VIRTUAL_ROOT_DEVICE } from '../../constants';

type DeviceWithChildren = Device & { title: string; key: string; children: DeviceWithChildren[] };

export const DeviceTree = ({
  selectedKeys,
  devices,
  height,
  onConfirm
}: {
  selectedKeys?: string[];
  devices: Device[];
  height: number;
  onConfirm?: (key: string) => void;
}) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = React.useState<string | undefined>(
    selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : undefined
  );
  return (
    <Tree
      defaultExpandAll={true}
      selectedKeys={selectedKeys}
      showIcon={true}
      treeData={buildDeviceTreeData(devices)}
      titleRender={(node) => {
        const device = devices.find((d) => `${d.id}` === node.key);
        return node.key !== VIRTUAL_ROOT_DEVICE.id.toString() ? (
          <>
            <Badge
              status={device && device.state && device.state.isOnline ? 'success' : 'default'}
              text={node.title}
            />
            {selectedKey && selectedKey === node.key && (
              <Popconfirm
                title={intl.get('DELETE_SOMETHING_PROMPT', { something: node.title })}
                onConfirm={() => onConfirm?.(node.key as string)}
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
  );
};

function buildDeviceTreeData(devices: Device[]): TreeDataNode[] {
  const nodes: TreeDataNode[] = [];
  devices.forEach((dev) => {
    if (dev.macAddress === VIRTUAL_ROOT_DEVICE.macAddress) {
      const { name, id, children } = getDeviceWithChildren(dev, devices);
      nodes.push({
        title: intl.get(name),
        key: `${id}`,
        children
      });
    }
  });
  return nodes;
}

function getDeviceWithChildren(dev: Device, devices: Device[]): DeviceWithChildren {
  const children = devices.filter((d) => d.parent === dev.macAddress);
  return {
    ...dev,
    title: dev.name,
    key: `${dev.id}`,
    children: children.map((d) => getDeviceWithChildren(d, devices))
  };
}
