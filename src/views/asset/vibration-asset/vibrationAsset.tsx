import React from 'react';
import intl from 'react-intl-universal';
import { ChartContainer } from '../../../components/charts/chartContainer';
import './style.css';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText,
  getAssetStatistics
} from '../common/statisticsHelper';
import { ColorDanger, ColorHealth, ColorInfo, ColorWarn } from '../../../constants/color';
import DianJi from './dianji.png';
import { AssetRow } from '../types';
import { Table, Tag } from 'antd';
import { getPropertyColumns, MonitoringPointRow } from '../../monitoring-point';
import dayjs from '../../../utils/dayjsUtils';
import { useLocaleContext } from '../../../localeProvider';
import { SettingsDetail } from './settingsDetail';
import { TabsCard } from '../../../components/tabsCard';
import { UpdateVibrationAsset2 } from './update2';
import { Points } from './points';
export const VibrationAsset = ({ asset, refresh }: { asset: AssetRow; refresh: () => void }) => {
  const { language } = useLocaleContext();
  const { alertLevel, monitoringPoints = [], name, statistics } = asset;
  const data = getAssetStatistics(
    statistics,
    ['normal', intl.get('ALARM_LEVEL_NORMAL')],
    ['danger', intl.get('ALARM_LEVEL_CRITICAL')],
    ['warn', intl.get('ALARM_LEVEL_MAJOR')],
    ['info', intl.get('ALARM_LEVEL_MINOR')]
  ).statistics.map(({ name, value, color }) => ({
    name,
    value,
    itemStyle: { color }
  }));
  const [activeKey, setActiveKey] = React.useState('overview');

  return (
    <TabsCard
      activeKey={activeKey}
      items={[
        {
          key: 'overview',
          label: intl.get('OVERVIEW'),
          children: (
            <div id='vibration-asset'>
              <div className='summary'>
                {data.length > 0 && (
                  <div className='analysis'>
                    <ChartContainer
                      options={
                        {
                          title: {
                            text: `${statistics.monitoringPointNum}`,
                            textStyle: { fontWeight: 600, fontSize: 24 },
                            subtext: '监测点总数',
                            left: 'center',
                            top: 70
                          },
                          legend: {
                            bottom: 10,
                            itemWidth: 10,
                            itemHeight: 10,
                            itemGap: 5,
                            left: 50,
                            formatter: (itemName: string) => {
                              const series = data.find(({ name }) => itemName === name);
                              return series ? `${itemName} {value|${series.value}}` : itemName;
                            },
                            textStyle: {
                              rich: {
                                value: {
                                  display: 'inline-block',
                                  backgroundColor: 'transparent',
                                  width: 30
                                }
                              }
                            }
                          },
                          series: [
                            {
                              type: 'pie',
                              name: '',
                              center: ['50%', 100],
                              radius: [55, 70],
                              label: { show: false, formatter: '{b} {c}' },
                              data
                            }
                          ]
                        } as any
                      }
                      style={{ height: '100%' }}
                      title='监测点统计'
                    />
                    <div style={{ position: 'relative' }}>
                      <ChartContainer
                        options={
                          {
                            series: [
                              {
                                type: 'gauge',
                                axisLine: {
                                  lineStyle: {
                                    width: 10,
                                    color: [
                                      [0.7, ColorDanger],
                                      [0.8, ColorWarn],
                                      [0.9, ColorInfo],
                                      [1, ColorHealth]
                                    ]
                                  }
                                },
                                pointer: {
                                  width: 3,
                                  length: '55%',
                                  itemStyle: {
                                    color: 'auto'
                                  }
                                },
                                axisTick: {
                                  distance: -10,
                                  length: 5,
                                  lineStyle: {
                                    color: '#fff',
                                    width: 1
                                  }
                                },
                                splitLine: {
                                  distance: -10,
                                  length: 8,
                                  lineStyle: {
                                    color: '#fff',
                                    width: 1
                                  }
                                },
                                axisLabel: {
                                  color: 'inherit',
                                  distance: 16,
                                  fontSize: 10
                                },
                                detail: {
                                  valueAnimation: true,
                                  color: 'inherit',
                                  fontSize: 16
                                },
                                center: ['50%', 100],
                                radius: 70,
                                data: [
                                  {
                                    value: 70
                                  }
                                ]
                              }
                            ]
                          } as any
                        }
                        style={{ height: '100%' }}
                        title='健康指数'
                      />
                      <ul
                        style={{
                          position: 'absolute',
                          left: 50,
                          bottom: 20,
                          margin: 0,
                          padding: 0,
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          listStyle: 'none',
                          textAlign: 'center',
                          fontSize: 12,
                          color: '#8a8e99',
                          width: '60%'
                        }}
                      >
                        <li style={{ width: '50%' }}>
                          <span style={{ marginRight: 6, color: ColorDanger }}>极差</span>
                          <span>&lt;=70</span>
                        </li>
                        <li style={{ width: '50%' }}>
                          <span style={{ marginRight: 6, color: ColorWarn }}>较差</span>
                          <span>70-80</span>
                        </li>
                        <li style={{ width: '50%' }}>
                          <span style={{ marginRight: 6, color: ColorInfo }}>一般</span>
                          <span>80-90</span>
                        </li>
                        <li style={{ width: '50%' }}>
                          <span style={{ marginRight: 6, color: ColorHealth }}>良好</span>
                          <span>&gt;&nbsp;&nbsp;&nbsp;90</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className='main'>
                  <div className='content'>
                    <img src={DianJi} alt='' />
                  </div>
                </div>
                <div className='info'>
                  <div
                    style={{
                      borderBottom: 'solid 1px #f0f0f0',
                      height: 36,
                      lineHeight: '36px',
                      padding: '0 10px'
                    }}
                  >
                    基本信息
                  </div>
                  {asset.attributes && <SettingsDetail settings={asset.attributes} />}
                </div>
              </div>
              <div className='monitoring-points'>
                <Table
                  bordered
                  columns={[
                    { dataIndex: 'name', title: intl.get('NAME') },
                    ...getPropertyColumns(monitoringPoints[0], language),
                    {
                      dataIndex: 'data',
                      key: 'timestamp',
                      render: (d: MonitoringPointRow['data']) =>
                        d?.timestamp
                          ? dayjs(d?.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
                          : '-',
                      title: intl.get('SAMPLING_TIME')
                    }
                  ]}
                  dataSource={monitoringPoints}
                  size='small'
                />
              </div>
            </div>
          )
        },
        {
          key: 'settings',
          label: intl.get('SETTINGS'),
          children: <UpdateVibrationAsset2 asset={asset} onSuccess={refresh} />
        },
        {
          key: 'monitoringPointList',
          label: intl.get('MONITORING_POINT_LIST'),
          children: <Points asset={asset} onSuccess={refresh} />
        }
      ]}
      tabBarExtraContent={{
        left: (
          <div
            style={{
              marginRight: 30
            }}
          >
            <Tag color={getAlarmLevelColor(convertAlarmLevelToState(alertLevel || 0))}>
              {getAlarmStateText(convertAlarmLevelToState(alertLevel || 0))}
            </Tag>
            {name}
          </div>
        )
      }}
      onChange={setActiveKey}
    />
  );
};
