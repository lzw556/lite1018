import TableLayout from '../../views/layout/TableLayout';
import { FC, useEffect, useState } from 'react';
import useSocket, { SocketTopic } from '../../socket';
import _ from 'lodash';
import { Device } from '../../types/device';
import { isMobile } from '../../utils/deviceDetection';

export interface DeviceTableProps {
  columns?: any;
  dataSource?: any;
  permissions?: any;
  emptyText?: any;
  onChange?: any;
  rowSelection?: any;
}

const DeviceTable: FC<DeviceTableProps> = ({
  columns,
  emptyText,
  dataSource,
  permissions,
  rowSelection,
  onChange
}) => {
  const { PubSub } = useSocket();
  const [data, setData] = useState<any>(dataSource);

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  useEffect(() => {
    PubSub.subscribe(SocketTopic.connectionState, (msg: string, state: any) => {
      if (state && data) {
        const newData = _.cloneDeep(data);
        const index = newData.result.findIndex(
          (item: Device) => item.macAddress === state.macAddress
        );
        if (index > -1) {
          newData.result[index].state.isOnline = state.isOnline;
          setData(newData);
        }
      }
    });
    PubSub.subscribe(SocketTopic.upgradeStatus, (msg: string, status: any) => {
      if (status && data) {
        const newData = _.cloneDeep(data);
        const index = newData.result.findIndex(
          (item: Device) => item.macAddress === status.macAddress
        );
        if (index > -1) {
          newData.result[index].upgradeStatus = {
            code: status.code,
            progress: status.progress
          };
          setData(newData);
        }
      }
    });

    return () => {
      PubSub.unsubscribe(SocketTopic.connectionState);
      PubSub.unsubscribe(SocketTopic.upgradeStatus);
    };
  }, [data]);

  return (
    <TableLayout
      rowSelection={rowSelection}
      emptyText={emptyText ? emptyText : '设备列表为空'}
      columns={columns}
      permissions={permissions}
      dataSource={data}
      onPageChange={onChange}
      simple={isMobile}
      scroll={isMobile ? { x: 1000 } : undefined}
    />
  );
};

export default DeviceTable;
