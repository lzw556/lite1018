import { Device } from '../../../../types/device';
import { FC, useCallback, useEffect, useState } from 'react';
import { Col, Row, Space, DatePicker, Button } from 'antd';
import moment from 'moment';
import { Content } from 'antd/es/layout/layout';
import {
  BatchDeleteDeviceEventsRequest,
  GetDeviceEventsRequest,
  PagingDeviceEventsRequest
} from '../../../../apis/device';
import TableLayout from '../../../layout/TableLayout';
import HasPermission from '../../../../permission';
import usePermission, { Permission } from '../../../../permission/permission';
import { store } from '../../../../store';

const { RangePicker } = DatePicker;

export interface DeviceEventProps {
  device: Device;
}

const DeviceEvent: FC<DeviceEventProps> = ({ device }) => {
  const [startDate, setStartDate] = useState<moment.Moment>(
    moment().startOf('day').subtract(7, 'd')
  );
  const [endDate, setEndDate] = useState<moment.Moment>(moment().endOf('day'));
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
      title: '类型',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '说明',
      dataIndex: 'content',
      key: 'content'
    }
  ];
  if (isPlatformAccount) {
    columns.push({
      title: '详情',
      dataIndex: 'message',
      key: 'message'
    });
  }
  columns.push({
    title: '发生时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (timestamp: number) => {
      return moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss');
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
                  批量删除
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
                      setStartDate(moment(date[0]));
                      setEndDate(moment(date[1]));
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
