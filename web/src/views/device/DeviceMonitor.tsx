import { Col, Row, Pagination, Select } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import * as React from 'react';
import Label from '../../components/label';
import { GetAlertStatisticsRequest, GetDeviceStatisticsRequest } from '../../apis/statistic';
import ShadowCard from '../../components/shadowCard';
import {
  AlarmLevelCritical,
  AlarmLevelInfo,
  AlarmLevelWarn,
  GetAlarmLevelSkin,
  GetAlarmLevelString
} from '../../constants/rule';
import MyBreadcrumb from '../../components/myBreadcrumb';
import { PageResult } from '../../types/page';
import { PagingDevicesRequest } from '../../apis/device';
import { SingleDeviceInfo } from './SingleDeviceInfo';
import { Device } from '../../types/device';
import './index.css';
import { DeviceType } from '../../types/device_type';
import EChartsReact from 'echarts-for-react';
import { DefaultMultiBarOption, DefaultPieOption } from '../../constants/chart';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../constants/color';
import { Network } from '../../types/network';
import { GetNetworksRequest } from '../../apis/network';
import { number } from 'echarts';
import moment from 'moment';
const { Option } = Select;

const DeviceMonitor = () => {
  const [networks, setNetworks] = React.useState<Network[]>([]);
  const [network, setNetwork] = React.useState<number>(0);
  const [count, setCount] = React.useState<{ isOnline: boolean; alertLevel: number }[]>([]);
  const [dataSource, setDataSource] = React.useState<PageResult<any>>();
  const [countAlarm, setCountAlarm] = React.useState<
    { timestamp: number; info: number; warn: number; critical: number }[]
  >([]);
  const types = [
    DeviceType.BoltLoosening,
    DeviceType.BoltElongation,
    DeviceType.HighTemperatureCorrosion,
    DeviceType.NormalTemperatureCorrosion,
    DeviceType.AngleDip,
    DeviceType.PressureTemperature,
    DeviceType.VibrationTemperature3Axis
  ].join(',');
  const fetchDevices = React.useCallback(
    (current: number, size: number) => {
      const filter: any = { types };
      if (network) {
        filter.network_id = network;
      }
      if (network !== 0) PagingDevicesRequest(current, size, filter).then(setDataSource);
    },
    [network, types]
  );

  React.useEffect(() => {
    GetNetworksRequest().then(setNetworks);
  }, []);

  React.useEffect(() => {
    if (networks.length > 0) setNetwork(networks[0].id);
  }, [networks]);

  React.useEffect(() => {
    const filter: any = { types };
    if (network) {
      filter.network_id = network;
    }
    if (network !== 0) {
      GetDeviceStatisticsRequest(filter).then(setCount);
      GetAlertStatisticsRequest(filter).then(setCountAlarm);
    }
  }, [network, types]);

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
    const levels = groupedLevels
      .map((level) => ({
        level,
        sum: count.filter((item) => item.alertLevel === level).length
      }))
      .sort((level1, level2) => level1.level - level2.level);

    const commonOptions = {
      ...DefaultPieOption,
      title: { text: '设备状态', left: '32%', top: '8%' },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        bottom: '15%',
        selectedMode: false
      },
      series: [
        {
          ...DefaultPieOption.series[0],
          radius: '50%',
          center: ['40%', '50%']
        }
      ]
    };

    return (
      <ShadowCard>
        <Row>
          <Col span={8}>
            <EChartsReact
              option={{
                ...commonOptions,
                series: [
                  {
                    ...commonOptions.series[0],
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
                  ...commonOptions,
                  title: { ...commonOptions.title, text: '报警统计' },
                  series: [
                    {
                      ...commonOptions.series[0],
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
          {countAlarm.length > 0 && (
            <Col span={8}>
              <EChartsReact
                option={{
                  ...DefaultMultiBarOption,
                  title: { text: '一周报警趋势', left: '40%', top: '8%' },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                    bottom: '15%',
                    selectedMode: false
                  },
                  grid: { left: '28%', top: '30%' },
                  xAxis: {
                    ...DefaultMultiBarOption.xAxis,
                    data: countAlarm.map(({ timestamp }) =>
                      moment.unix(timestamp).local().format('MM/DD')
                    )
                  },
                  series: [
                    {
                      name: AlarmLevelInfo,
                      type: 'bar',
                      data: countAlarm.map(({ info }) => info),
                      color: ColorInfo
                    },
                    {
                      name: AlarmLevelWarn,
                      type: 'bar',
                      data: countAlarm.map(({ warn }) => warn),
                      color: ColorWarn
                    },
                    {
                      name: AlarmLevelCritical,
                      type: 'bar',
                      data: countAlarm.map(({ critical }) => critical),
                      color: ColorDanger
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

  if (networks.length > 0) {
    return (
      <Content>
        <MyBreadcrumb />
        <ShadowCard>
          <Row>
            <Col span={4}>
              <Label name={'网络'}>
                <Select
                  bordered={false}
                  onChange={(val) => setNetwork(Number(val))}
                  allowClear
                  placeholder={'请选择网络'}
                  defaultValue={networks[0].id}
                >
                  {networks.map((network) => (
                    <Option key={network.id} value={network.id}>
                      {network.name}
                    </Option>
                  ))}
                </Select>
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
          {dataSource && dataSource?.total > 0 && (
            <Row justify={'end'} style={{ textAlign: 'right' }}>
              <Col span={24}>
                {!Array.isArray(dataSource) && (
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
          )}
        </ShadowCard>
      </Content>
    );
  } else {
    return <p>没有网络</p>;
  }
};

export default DeviceMonitor;
