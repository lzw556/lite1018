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
import { ColorDanger, ColorHealth, ColorInfo, ColorOffline, ColorWarn } from '../../constants/color';
import { Network } from '../../types/network';
import { GetNetworksRequest } from '../../apis/network';
import moment from 'moment';
import { isMobile } from '../../utils/deviceDetection';
import { useLocation } from 'react-router-dom';
import { Filters, omitSpecificKeys } from './util';
import { PagedOption } from '../../types/props';
import { EmptyLayout } from '../layout';

const { Option } = Select;

const DeviceMonitor = () => {
  const types = [
    DeviceType.BoltLoosening,
    DeviceType.BoltElongation,
    DeviceType.HighTemperatureCorrosion,
    DeviceType.NormalTemperatureCorrosion,
    DeviceType.AngleDip,
    DeviceType.PressureTemperature,
    DeviceType.VibrationTemperature3Axis
  ].join(',');
  const [networks, setNetworks] = React.useState<Network[]>([]);
  const { state } = useLocation<{filters: Filters; pagedOptions: PagedOption;}>();
  const pagedOptionsDefault = { index: 1, size: 12 };
  const [pagedOptions, setPagedOptions] = React.useState(state ? state.pagedOptions : pagedOptionsDefault);
  const [filters, setFilters] = React.useState<Filters | undefined>(state ? {...state.filters, types}: {network_id: 0, types });
  const [count, setCount] = React.useState<{ isOnline: boolean; alertLevel: number }[]>([]);
  const [dataSource, setDataSource] = React.useState<PageResult<any>>();
  const [countAlarm, setCountAlarm] = React.useState<
    { timestamp: number; info: number; warn: number; critical: number }[]
  >([]);

  React.useEffect(() => {
    GetNetworksRequest().then(setNetworks);
  }, []);

  React.useEffect(() => {
    if (networks.length > 0 && filters?.network_id === 0) setFilters(prev => ({...prev, network_id: networks[0].id}));
  }, [networks, filters]);

  React.useEffect(() => {
    if(filters?.network_id !== 0) {
      const _filters = omitSpecificKeys(filters ?? {}, []);
      GetDeviceStatisticsRequest(_filters).then(setCount);
      GetAlertStatisticsRequest(_filters).then(setCountAlarm);
    }
  }, [filters]);

  React.useEffect(() => {
    const {index, size} = pagedOptions;
    if(filters?.network_id !== 0){
      PagingDevicesRequest(index, size, omitSpecificKeys(filters ?? {}, [])).then(setDataSource)
    }
  }, [filters, pagedOptions]);

  const emptyTips = <ShadowCard><EmptyLayout description='没有设备'/></ShadowCard>
  const renderStatistic = () => {
    if (count.length === 0) return emptyTips;
    const countOnline = count.filter((item) => item.isOnline).length;
    const countOffline = count.filter((item) => !item.isOnline).length;
    let groupedLevels: number[] = [];
    count
      // .filter((item) => item.alertLevel > 0)
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
      title: { text: '设备状态', left: isMobile ? '50%' : '32%', top: isMobile ? 'auto' : '8%' },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        bottom: isMobile ? 'auto' : '15%',
        selectedMode: false
      },
      series: [
        {
          ...DefaultPieOption.series[0],
          radius: '50%',
          center: [isMobile ? '50%' : '40%', '50%']
        }
      ]
    };

    return (
      <ShadowCard>
        <Row>
          <Col span={isMobile ? 24 : 8}>
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
                        itemStyle: { color: ColorOffline }
                      }
                    ]
                  }
                ]
              }}
            />
          </Col>
          {levels.length > 0 && (
            <Col span={isMobile ? 24 : 8}>
              <EChartsReact
                option={{
                  ...commonOptions,
                  title: { ...commonOptions.title, text: '报警统计' },
                  series: [
                    {
                      ...commonOptions.series[0],
                      data: levels.map(({ level, sum }) => ({
                        value: sum,
                        name: `${GetAlarmLevelString(level) || '正常'} ${sum}`,
                        itemStyle: { color: GetAlarmLevelSkin(level) || ColorHealth }
                      }))
                    }
                  ]
                }}
              />
            </Col>
          )}
          {countAlarm.length > 0 && (
            <Col span={isMobile ? 24 : 8}>
              <EChartsReact
                option={{
                  ...DefaultMultiBarOption,
                  title: {
                    text: '一周报警趋势',
                    left: isMobile ? '50%' : '42%',
                    top: isMobile ? 'auto' : '8%'
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                    bottom: isMobile ? 'auto' : '15%',
                    selectedMode: false
                  },
                  grid: { left: '28%', top: '30%' },
                  xAxis: {
                    ...DefaultMultiBarOption.xAxis,
                    data: countAlarm.map(({ timestamp }) =>
                      moment.unix(timestamp).local().format('MM/DD')
                    )
                  },
                  yAxis: { minInterval: 1},
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
            <Col span={isMobile ? 18 : 4}>
              {filters?.network_id !== 0 && <Label name={'网络'}>
                <Select
                  bordered={false}
                  onChange={(val) => {
                    setFilters(prev => ({...prev, network_id: val}));
                    setPagedOptions(pagedOptionsDefault);
                  }}
                  allowClear
                  placeholder={'请选择网络'}
                  defaultValue={filters?.network_id}
                >
                  {networks.map((network) => (
                    <Option key={network.id} value={network.id}>
                      {network.name}
                    </Option>
                  ))}
                </Select>
              </Label>}
            </Col>
          </Row>
          <br />
          {renderStatistic()}
          <br />
          <Row className='device-list'>
            {dataSource &&
              dataSource.result.map((device: Device) => (
                <Col key={device.id} className='device'>
                  <SingleDeviceInfo device={device} rememberdState={{filters, pagedOptions}}/>
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
                      pageSizeOptions: ['12', '24', '36', '48', '60'],
                      onChange: (index, size) => setPagedOptions({index, size})
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
    return emptyTips;
  }
};

export default DeviceMonitor;
