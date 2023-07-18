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
  MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING,
  MonitoringPointTypeValue
} from '../../types';
import { DynamicDataContent } from './dynamicDataContent';
import {
  DynamicDataProperty,
  VibrationWaveFormDataType,
  useDynamicDataRequest
} from './dynamicDataHelper';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../../localeProvider';
import { VibrationDynamicDataContent } from './vibrationDynamicDataContent';
import { isMobile } from '../../../../utils/deviceDetection';

export const MonitoringPointDynamicData: React.FC<MonitoringPointRow & { dataType?: DataType }> = (
  props
) => {
  const { language } = useLocaleContext();
  const [range, setRange] = React.useState<[number, number]>();
  const { hasPermission } = usePermission();
  const isVibration = props.type === MonitoringPointTypeValue.VIBRATION;
  const getDynamicDataType = () => {
    const config = MONITORING_POINT_TYPE_VALUE_DYNAMIC_MAPPING.get(props.type);
    if (props.dataType === 'raw') {
      return config?.dynamicData;
    } else if (props.dataType === 'waveform') {
      return config?.waveData;
    }
  };

  const dynamicDataType = getDynamicDataType();
  const [vibrationFilters, setVibrationFilters] = React.useState<
    { field: string; axis: number } | undefined
  >(
    isVibration
      ? {
          field: dynamicDataType?.fields[0].value!,
          axis: 0
        }
      : undefined
  );
  const {
    all: { timestamps, loading },
    selected: { timestamp, dynamicData, setTimestamp }
  } = useDynamicDataRequest<DynamicDataProperty | VibrationWaveFormDataType>(
    props.id,
    props.dataType,
    range,
    vibrationFilters
  );

  const renderTimestampsList = () => {
    return (
      <Table
        size={'middle'}
        scroll={{ y: isMobile ? 200 : 600 }}
        showHeader={false}
        columns={[
          {
            title: intl.get('TIMESTAMP'),
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: '80%',
            render: (timestamp: number) =>
              dayjs.unix(timestamp).local().format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: intl.get('OPERATION'),
            key: 'action',
            render: (text: any, record: any) => {
              if (hasPermission(Permission.DeviceRawDataDownload)) {
                return (
                  <Space
                    size='middle'
                    onClick={() => {
                      downloadRawHistory(
                        props.id,
                        text.timestamp,
                        language === 'en-US' ? 'en' : 'zh',
                        props.dataType,
                        isVibration ? vibrationFilters : undefined
                      ).then((res) => {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', getFilename(res));
                        document.body.appendChild(link);
                        link.click();
                      });
                    }}
                  >
                    <a>{intl.get('DOWNLOAD')}</a>
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
                <Empty
                  description={intl.get('NO_DATA_PROMPT')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Col>
            )}
            {timestamps.length > 0 && <Col span={isMobile ? 24 : 6}>{renderTimestampsList()}</Col>}
            {timestamp && dynamicDataType && dynamicData.values && !isVibration && (
              <DynamicDataContent
                key={props.dataType}
                type={dynamicDataType}
                data={{
                  values: dynamicData.values as DynamicDataProperty,
                  loading: dynamicData.loading
                }}
                monitoringPoint={{ ...props }}
              />
            )}
            {timestamp && dynamicDataType && dynamicData.values && isVibration && (
              <VibrationDynamicDataContent
                key={props.dataType}
                type={dynamicDataType}
                data={{
                  values: dynamicData.values as VibrationWaveFormDataType,
                  loading: dynamicData.loading
                }}
                onFieldChange={(field) =>
                  setVibrationFilters((prev) => {
                    if (prev) {
                      return { ...prev, field };
                    }
                  })
                }
                onAxisChange={(axis) =>
                  setVibrationFilters((prev) => {
                    if (prev) {
                      return { ...prev, axis };
                    }
                  })
                }
              />
            )}
          </Row>
        )}
      </Col>
    </Row>
  );
};
