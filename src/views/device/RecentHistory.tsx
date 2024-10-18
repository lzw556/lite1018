import { Col, Collapse, Empty, Row, Select } from 'antd';
import * as React from 'react';
import dayjs from '../../utils/dayjsUtils';
import { FindDeviceDataRequest } from '../../apis/device';
import { Device } from '../../types/device';
import { getDisplayProperties } from './util';
import { DeviceType } from '../../types/device_type';
import { Flex } from '../../components';
import Label from '../../components/label';
import intl from 'react-intl-universal';
import { ChartHeader } from '../../components/charts/chartHeader';
import { PropertyChart, transformHistoryData } from '../../components/charts/propertyChart';
import { DisplayProperty, displayPropertyGroup } from '../../constants/properties';
import { generateColProps } from '../../utils/grid';
import { HistoryData } from '../asset-common';

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
  }, [device.id, channel, channels.length]);

  const renderDeviceHistoryDataChart = () => {
    if (historyData && historyData.length > 0) {
      if (DeviceType.isVibration(device.typeId)) {
        return (
          <Collapse
            defaultActiveKey={displayPropertyGroup[0]}
            expandIconPosition='end'
            items={displayPropertyGroup.map((g) => ({
              key: g,
              label: intl.get(g),
              children: (
                <Row gutter={[32, 32]}>
                  {getDisplayProperties(device.properties, device.typeId)
                    .filter((p) => p.group === g)
                    .map((p: DisplayProperty, index: number) => {
                      const transform = transformHistoryData(historyData, p);
                      return (
                        <Col {...generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 })} key={index}>
                          {transform && (
                            <>
                              <ChartHeader property={p} values={transform.values} />
                              <PropertyChart
                                series={transform.series}
                                withArea={true}
                                xAxis={{ labelLimit: true }}
                                yAxis={p}
                              />
                            </>
                          )}
                        </Col>
                      );
                    })}
                </Row>
              )
            }))}
            size='small'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
          />
        );
      } else {
        return (
          <Row gutter={[32, 32]}>
            {getDisplayProperties(device.properties, device.typeId).map(
              (p: DisplayProperty, index: number) => {
                const transform = transformHistoryData(historyData, p);
                return (
                  <Col {...generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 })} key={index}>
                    {transform && (
                      <>
                        <ChartHeader property={p} values={transform.values} />
                        <PropertyChart
                          series={transform.series}
                          withArea={true}
                          xAxis={{ labelLimit: true }}
                          yAxis={p}
                        />
                      </>
                    )}
                  </Col>
                );
              }
            )}
          </Row>
        );
      }
    } else {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={intl.get('NO_DATA_PROMPT')}
          style={{ height: `400px` }}
        />
      );
    }
  };

  return (
    <>
      {channels.length > 0 && (
        <Flex style={{ marginBottom: 12 }}>
          <Label name={intl.get('CURRENT_CHANNEL')}>
            <Select onChange={(val) => setChannel(val)} defaultValue={channel} bordered={false}>
              {channels.map(({ label, value }) => (
                <Select.Option value={value} key={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Label>
        </Flex>
      )}
      {renderDeviceHistoryDataChart()}
    </>
  );
};
