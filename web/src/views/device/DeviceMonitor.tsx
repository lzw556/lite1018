import { Col, Row, Pagination } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';
import Label from '../../components/label';
import { GetDeviceStatisticsRequest } from '../../apis/statistic';
import NetworkSelect from '../../components/select/networkSelect';
import ShadowCard from '../../components/shadowCard';
import { GetAlarmLevelSkin, GetAlarmLevelString } from '../../constants/rule';
import MyBreadcrumb from '../../components/myBreadcrumb';
import { PageResult } from '../../types/page';
import { PagingDevicesRequest } from '../../apis/device';
import { SingleDeviceInfo } from './SingleDeviceInfo';
import { Device } from '../../types/device';
import './index.css';
import { DeviceType } from '../../types/device_type';
import EChartsReact from 'echarts-for-react';
import { DefaultPieOption } from '../../constants/chart';
import { ColorHealth, ColorWarn } from '../../constants/color';

const DeviceMonitor = () => {
  const [network, setNetwork] = React.useState<number>();
  const [count, setCount] = React.useState<{ isOnline: boolean; alertLevel: number }[]>([]);
  const [dataSource, setDataSource] = React.useState<PageResult<any>>();

  const fetchDevices = React.useCallback(
    (current: number, size: number) => {
      const types = [
        DeviceType.BoltLoosening,
        DeviceType.BoltElongation,
        DeviceType.HighTemperatureCorrosion,
        DeviceType.NormalTemperatureCorrosion,
        DeviceType.AngleDip,
        DeviceType.PressureTemperature,
        DeviceType.VibrationTemperature3Axis
      ].join(',');
      const filter: any = { types };
      if (network) {
        filter.network_id = network;
      }
      GetDeviceStatisticsRequest(filter).then(setCount);
      PagingDevicesRequest(current, size, filter).then(setDataSource);
    },
    [network]
  );

  React.useEffect(() => {
    fetchDevices(1, 10);
  }, [fetchDevices]);

  const renderStatistic = () => {
    if (count.length === 0) return null;
    const countOnline = count.filter((item) => item.isOnline).length;
    const countOffline = count.filter((item) => !item.isOnline).length;
    let groupedLevels: number[] = [];
    count
      .filter((item) => item.alertLevel > 0)
      .forEach((item) => {
        if (
          groupedLevels.length === 0 ||
          groupedLevels.find((level) => level === item.alertLevel) === undefined
        ) {
          groupedLevels.push(item.alertLevel);
        }
      });
    const levels = groupedLevels.map((level) => ({
      level,
      sum: count.filter((item) => item.alertLevel === level).length
    }));
    return (
      <ShadowCard>
        <Row>
          <Col span={8}>
            <EChartsReact
              option={{
                ...DefaultPieOption,
                title: { text: '在线离线', left: 'center' },
                legend: {
                  orient: 'vertical',
                  left: 'left'
                },
                series: [
                  {
                    ...DefaultPieOption.series[0],
                    radius: '50%',
                    center: ['50%', '50%'],
                    data: [
                      {
                        value: countOnline,
                        name: `在线 ${countOnline}`,
                        itemStyle: { color: ColorHealth }
                      },
                      {
                        value: countOffline,
                        name: `离线 ${countOffline}`,
                        itemStyle: { color: ColorWarn }
                      }
                    ]
                  }
                ]
              }}
            />
          </Col>
          {levels.length > 0 && (
            <Col span={8}>
              <EChartsReact
                option={{
                  ...DefaultPieOption,
                  title: { text: '报警', left: 'center' },
                  legend: {
                    orient: 'vertical',
                    left: 'left'
                  },
                  series: [
                    {
                      ...DefaultPieOption.series[0],
                      radius: '50%',
                      center: ['50%', '50%'],
                      data: levels.map(({ level, sum }) => ({
                        value: sum,
                        name: `${GetAlarmLevelString(level)} ${sum}`,
                        itemStyle: { color: GetAlarmLevelSkin(level) }
                      }))
                    }
                  ]
                }}
              />
            </Col>
          )}
        </Row>
      </ShadowCard>
    );
  };

  return (
    <Content>
      <MyBreadcrumb />
      <ShadowCard>
        <Row>
          <Col span={4}>
            <Label name={'网络'}>
              <NetworkSelect bordered={false} onChange={setNetwork} allowClear />
            </Label>
          </Col>
        </Row>
        <br />
        {renderStatistic()}
        <br />
        <Row className='device-list'>
          {dataSource &&
            dataSource.result.map((device: Device) => (
              <Col key={device.id} className='device'>
                <SingleDeviceInfo device={device} />
              </Col>
            ))}
        </Row>
        <Row justify={'end'} style={{ textAlign: 'right' }}>
          <Col span={24}>
            {dataSource && !Array.isArray(dataSource) && (
              <Pagination
                {...{
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '30', '40', '50'],
                  onChange: fetchDevices
                }}
                current={dataSource.page}
                total={dataSource.total}
                pageSize={dataSource.size}
              />
            )}
          </Col>
        </Row>
      </ShadowCard>
    </Content>
  );
};

export default DeviceMonitor;
