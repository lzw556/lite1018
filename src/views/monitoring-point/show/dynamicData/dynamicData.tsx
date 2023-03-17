import { Col, Empty, Row, Space, Spin, Table } from 'antd';
import React from 'react';
import { RangeDatePicker } from '../../../../components/rangeDatePicker';
import usePermission, { Permission } from '../../../../permission/permission';
import dayjs from '../../../../utils/dayjsUtils';
import { getFilename } from '../../../../utils/format';
import { downloadRawHistory } from '../../services';
import {
  DataType,
  MonitoringPointRow,
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING
} from '../../types';
import { DynamicDataContent } from './dynamicDataContent';
import { DynamicDataProperty, useDynamicDataRequest } from './dynamicDataHelper';

export const MonitoringPointDynamicData: React.FC<MonitoringPointRow & { dataType?: DataType }> = (
  props
) => {
  const [range, setRange] = React.useState<[number, number]>();
  const { hasPermission } = usePermission();
  const {
    all: { timestamps, loading },
    selected: { timestamp, dynamicData, setTimestamp }
  } = useDynamicDataRequest<DynamicDataProperty>(props.id, props.dataType, range);

  const getDynamicDataType = () => {
    const config = MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(props.type);
    if (props.dataType === 'raw') {
      return config?.dynamicData;
    } else if (props.dataType === 'waveform') {
      return config?.waveData;
    }
  };

  const dynamicDataType = getDynamicDataType();

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
              dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
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
              setTimestamp({ dataType: props.dataType, data: record.timestamp });
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
            {timestamp && dynamicDataType && dynamicData.values && (
              <DynamicDataContent
                key={props.dataType}
                type={dynamicDataType}
                data={{ values: dynamicData.values, loading: dynamicData.loading }}
              />
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};
