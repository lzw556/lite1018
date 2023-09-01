import React from 'react';
import { ALARM_LEVELS, Report } from './report';
import { ChartContainer } from '../../../components/charts/chartContainer';
import {
  ColorDanger,
  ColorHealth,
  ColorInfo,
  ColorOffline,
  ColorWarn
} from '../../../constants/color';

export const Status = ({ report }: { report: Report }) => {
  const renderStatus = (title: string, states: string[], data: number[], color: string[]) => {
    return (
      <div className='container'>
        <div className='item' style={{ width: '80%' }}>
          <p className='title'>{title}</p>
          <ChartContainer
            title=''
            options={
              {
                title: {
                  text: '',
                  left: 'center'
                },
                tooltip: {
                  trigger: 'item',
                  formatter: '{c}'
                },
                legend: {
                  orient: 'vertical',
                  left: 'left',
                  top: 'middle'
                },
                dataset: {
                  source: {
                    item: states,
                    data
                  }
                },
                series: [
                  {
                    type: 'pie',
                    radius: '50%',
                    label: {
                      show: true,
                      formatter: '{c}({d}%)'
                    }
                  }
                ],
                color
              } as any
            }
          />
        </div>
      </div>
    );
  };

  const renderAlarmText = (assetsStat: Report['assetsStat'], title: string) => {
    const { minorAlarmNum, majorAlarmNum, criticalAlarmNum } = assetsStat;
    return ALARM_LEVELS.filter((s, i) => i > 0)
      .reverse()
      .map((s, index) => (
        <span>
          <span className='value'>
            {index === 0 ? criticalAlarmNum : index === 1 ? majorAlarmNum : minorAlarmNum}
          </span>
          个{title}处于{s}报警状态{index < 2 ? '，' : ''}
        </span>
      ));
  };

  const renderAssetsSummary = (assetsStat: Report['assetsStat']) => {
    const { minorAlarmNum, majorAlarmNum, criticalAlarmNum } = assetsStat;
    const total = minorAlarmNum + majorAlarmNum + criticalAlarmNum;
    return (
      <span>
        本周共有<span className='value'>{total}</span>个资产处于报警状态，其中
        {renderAlarmText(assetsStat, '资产')}；
      </span>
    );
  };

  const renderMonitoringPointsSummary = (monitoringPointsStat: Report['monitoringPointsStat']) => {
    return (
      <span>
        其中，有
        {renderAlarmText(monitoringPointsStat, '监测点')}；
      </span>
    );
  };

  const renderDevicesSummary = (devicesStat: Report['devicesStat']) => {
    const { offlineNum } = devicesStat;
    return (
      <span>
        出现<span className='value'>{offlineNum}</span>
        台设备离线，请检查网络是否通畅，网关是否正常，设备是否需要更换电池
      </span>
    );
  };

  const verifyAlarm = (assetsStat: Report['assetsStat']) => {
    const { minorAlarmNum, majorAlarmNum, criticalAlarmNum } = assetsStat;
    return minorAlarmNum + majorAlarmNum + criticalAlarmNum > 0;
  };

  return (
    <>
      <section className='page status'>
        <h3>一、 资产和设备健康状态概述</h3>
        {renderStatus(
          '资产状态',
          ALARM_LEVELS,
          [
            report?.assetsStat.normalAlarmNum,
            report?.assetsStat.minorAlarmNum,
            report?.assetsStat.majorAlarmNum,
            report?.assetsStat.criticalAlarmNum
          ],
          [ColorHealth, ColorInfo, ColorWarn, ColorDanger]
        )}
        {renderStatus(
          '监测点状态',
          ALARM_LEVELS,
          [
            report?.monitoringPointsStat.normalAlarmNum,
            report?.monitoringPointsStat.minorAlarmNum,
            report?.monitoringPointsStat.majorAlarmNum,
            report?.monitoringPointsStat.criticalAlarmNum
          ],
          [ColorHealth, ColorInfo, ColorWarn, ColorDanger]
        )}
      </section>
      <section className='page status'>
        {renderStatus(
          '设备状态',
          ['在线', '离线'],
          [report?.devicesStat.onlineNum, report?.devicesStat.offlineNum],
          [ColorHealth, ColorOffline]
        )}
        <section>
          <p>
            {report?.assetsStat &&
              verifyAlarm(report.assetsStat) &&
              renderAssetsSummary(report?.assetsStat)}
            {report?.monitoringPointsStat &&
              verifyAlarm(report.monitoringPointsStat) &&
              renderMonitoringPointsSummary(report?.monitoringPointsStat)}
            {(verifyAlarm(report.assetsStat) || verifyAlarm(report.monitoringPointsStat)) && <br />}
            {report?.devicesStat &&
              report?.devicesStat.offlineNum > 0 &&
              renderDevicesSummary(report?.devicesStat)}
          </p>
        </section>
      </section>
    </>
  );
};
