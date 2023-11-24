import { Card, Col, Empty, Row, Select, Space } from 'antd';
import * as React from 'react';
import dayjs from '../../utils/dayjsUtils';
import { FindDeviceDataRequest } from '../../apis/device';
import { Device } from '../../types/device';
import { isMobile } from '../../utils/deviceDetection';
import { getDisplayProperties } from './util';
import { DeviceType } from '../../types/device_type';
import Label from '../../components/label';
import intl from 'react-intl-universal';
import { ChartHeader } from '../../components/charts/chartHeader';
import { HistoryData } from '../monitoring-point';
import { PropertyChart, transformHistoryData } from '../../components/charts/propertyChart';
import { DisplayProperty } from '../../constants/properties';

export const RecentHistory: React.FC<{ device: Device }> = ({ device }) => {
  const channels = DeviceType.isMultiChannel(device.typeId, true);
  const [historyData, setHistoryData] = React.useState<HistoryData>();
  const [channel, setChannel] = React.useState('1');

  React.useEffect(() => {
    FindDeviceDataRequest(
      device.id,
      dayjs().startOf('day').subtract(13, 'd').utc().unix(),
      dayjs().endOf('day').utc().unix(),
      channels.length > 0 ? { channel } : {}
    ).then(setHistoryData);
  }, [device, channel, channels.length]);

  const renderDeviceHistoryDataChart = () => {
    if (historyData && historyData.length > 0) {
      return getDisplayProperties(device.properties, device.typeId).map(
        (p: DisplayProperty, index: number) => {
          const { unit, precision } = p;
          const transform = transformHistoryData(historyData, p);
          return (
            <Card.Grid
              key={index}
              style={{ boxShadow: 'none', border: 'none', width: isMobile ? '100%' : '25%' }}
            >
              {transform && (
                <>
                  <ChartHeader property={p} values={transform.values} />
                  <PropertyChart
                    series={transform.series}
                    withArea={true}
                    xAxisLabelLimit={true}
                    yAxisMinInterval={p.interval}
                    yAxisValueMeta={{ unit, precision }}
                  />
                </>
              )}
            </Card.Grid>
          );
        }
      );
    }
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={intl.get('NO_DATA_PROMPT')}
        style={{ height: `400px` }}
      />
    );
  };

  return (
    <Row justify={'start'}>
      <Col span={24}>
        <Card
          bordered={false}
          title={
            channels.length > 0 && (
              <Space>
                <Label name={intl.get('CURRENT_CHANNEL')}>
                  <Select
                    onChange={(val) => setChannel(val)}
                    defaultValue={channel}
                    bordered={false}
                  >
                    {channels.map(({ label, value }) => (
                      <Select.Option value={value} key={value}>
                        {label}
                      </Select.Option>
                    ))}
                  </Select>
                </Label>
              </Space>
            )
          }
        >
          {renderDeviceHistoryDataChart()}
        </Card>
      </Col>
    </Row>
  );
};
