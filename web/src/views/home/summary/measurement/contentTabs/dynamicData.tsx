import { Col, Empty, Row, Space, Spin, Table } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { RangeDatePicker } from '../../../../../components/rangeDatePicker';
import usePermission, { Permission } from '../../../../../permission/permission';
import { getFilename } from '../../../common/utils';
import { MeasurementRow } from '../props';
import { downloadRawHistory } from '../services';
import { DynamicDataContent } from './dynamicDataContent';
import { DynamicDataProperty, useDynamicDataRequest } from './dynamicDataHelper';

export const DynamicData: React.FC<MeasurementRow> = (props) => {
  const [range, setRange] = React.useState<[number, number]>();
  const { hasPermission } = usePermission();
  const {
    all: { timestamps, loading },
    selected: { timestamp, dynamicData, setTimestamp }
  } = useDynamicDataRequest<DynamicDataProperty>(props.id, range);

  const renderTimestampsList = () => {
    return (
      <Table
        size={'middle'}
        scroll={{ y: 600 }}
        showHeader={false}
        columns={[
          {
            title: '时间',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) =>
              moment.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: '操作',
            key: 'action',
            render: (text: any, record: any) => {
              if (hasPermission(Permission.DeviceRawDataDownload)) {
                return (
                  <Space
                    size='middle'
                    onClick={() => {
                      downloadRawHistory(props.id, text.timestamp).then((res) => {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', getFilename(res));
                        document.body.appendChild(link);
                        link.click();
                      });
                    }}
                  >
                    <a>下载</a>
                  </Space>
                );
              }
            }
          }
        ]}
        pagination={false}
        dataSource={timestamps}
        rowClassName={(record) => (record.timestamp === timestamp ? 'ant-table-row-selected' : '')}
        onRow={(record) => ({
          onClick: () => {
            if (record.timestamp !== timestamp) {
              setTimestamp(record.timestamp);
            }
          },
          onMouseLeave: () => (window.document.body.style.cursor = 'default'),
          onMouseEnter: () => (window.document.body.style.cursor = 'pointer')
        })}
      />
    );
  };

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <RangeDatePicker
          onChange={React.useCallback((range: [number, number]) => setRange(range), [])}
        />
      </Col>
      <Col span={24}>
        {loading && <Spin />}
        {!loading && (
          <Row>
            {timestamps.length === 0 && (
              <Col span={24}>
                <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Col>
            )}
            {timestamps.length > 0 && <Col span={6}>{renderTimestampsList()}</Col>}
            {timestamp && dynamicData.values && (
              <DynamicDataContent
                type={{
                  fields: [
                    { label: '预紧力', value: 'dynamic_preload', unit: 'kN' },
                    { label: '应力', value: 'dynamic_pressure', unit: 'MPa' },
                    { label: '长度', value: 'dynamic_length', unit: 'mm' },
                    { label: '飞行时间', value: 'dynamic_tof', unit: 'ns' },
                    { label: '加速度', value: 'dynamic_acceleration', unit: 'g' }
                  ],
                  metaData: [
                    { label: '预紧力', value: 'min_preload', unit: 'kN' },
                    { label: '长度', value: 'min_length', unit: 'mm' },
                    { label: '温度', value: 'temperature', unit: '℃' },
                    { label: '飞行时间', value: 'min_tof', unit: 'ns' },
                    { label: '缺陷位置', value: 'defect_location', unit: 'mm' }
                  ]
                }}
                data={{ values: dynamicData.values, loading: dynamicData.loading }}
              />
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};
