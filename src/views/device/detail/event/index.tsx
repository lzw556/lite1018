import { Device } from '../../../../types/device';
import { FC, useCallback, useEffect, useState } from 'react';
import { Col, Row, Space, DatePicker, Button } from 'antd';
import dayjs, { Dayjs } from '../../../../utils/dayjsUtils';
import { Content } from 'antd/es/layout/layout';
import { BatchDeleteDeviceEventsRequest, PagingDeviceEventsRequest } from '../../../../apis/device';
import TableLayout from '../../../layout/TableLayout';
import HasPermission from '../../../../permission';
import usePermission, { Permission } from '../../../../permission/permission';
import { store } from '../../../../store';
import intl from 'react-intl-universal';

const { RangePicker } = DatePicker;

export interface DeviceEventProps {
  device: Device;
}

const DeviceEvent: FC<DeviceEventProps> = ({ device }) => {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf('day').subtract(7, 'd'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs().endOf('day'));
  const [dataSource, setDataSource] = useState<any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const { hasPermission } = usePermission();
  const isPlatformAccount =
    store.getState().permission.data.subject === 'admin' ||
    store.getState().permission.data.subject === '平台管理员';

  const fetchDeviceEvents = useCallback(
    (current: number, size: number) => {
      PagingDeviceEventsRequest(
        device.id,
        startDate.utc().unix(),
        endDate.utc().unix(),
        current,
        size
      ).then(setDataSource);
    },
    [startDate, endDate]
  );

  useEffect(() => {
    fetchDeviceEvents(1, 10);
  }, [fetchDeviceEvents]);

  const columns: any = [
    {
      title: intl.get('TYPE'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        return intl.get(record.name);
      }
    },
    {
      title: intl.get('EVENT_CONTENT'),
      dataIndex: 'content',
      key: 'content',
      render: (text: string, record: any) => {
        return record.content ? intl.get(record.content).d(record.content) : record.content;
      }
    }
  ];
  if (isPlatformAccount) {
    columns.push({
      title: intl.get('DETAIL'),
      dataIndex: 'message',
      key: 'message',
      render: (text: string, record: any) => {
        return record.message ? intl.get(record.message).d(record.message) : record.message;
      }
    });
  }
  columns.push({
    title: intl.get('OCCURRENCE'),
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (timestamp: number) => {
      return dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss');
    }
  });

  const onBatchDelete = () => {
    BatchDeleteDeviceEventsRequest(device.id, selectedRowKeys).then(() => {
      setSelectedRowKeys([]);
      fetchDeviceEvents(1, 10);
    });
  };

  const rowSelection = {
    setSelectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    }
  };

  return (
    <Content>
      <Row justify='center'>
        <Col span={12}>
          <Row justify={'start'}>
            <Col span={6}>
              <HasPermission value={Permission.DeviceEventDelete}>
                <Button disabled={selectedRowKeys.length === 0} onClick={() => onBatchDelete()}>
                  {intl.get('BATCH_DELETE')}
                </Button>
              </HasPermission>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row justify='end'>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space style={{ textAlign: 'center' }}>
                <RangePicker
                  allowClear={false}
                  value={[startDate, endDate]}
                  onChange={(date, dateString) => {
                    if (date) {
                      setStartDate(dayjs(date[0]));
                      setEndDate(dayjs(date[1]));
                    }
                  }}
                />
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
      <br />
      <Row justify={'start'}>
        <Col span={24}>
          <TableLayout
            rowSelection={hasPermission(Permission.DeviceEventDelete) && rowSelection}
            columns={columns}
            dataSource={dataSource}
            onPageChange={fetchDeviceEvents}
          />
        </Col>
      </Row>
    </Content>
  );
};

export default DeviceEvent;
