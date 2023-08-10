import React from 'react';
import { REPORT, Report } from './report';
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
    console.log('opsopsops', {
      title: {
        text: '',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
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
    });
    return (
      <div key={title} style={{ width: '80%', margin: 'auto' }}>
        <p style={{ marginTop: 30, textAlign: 'center' }}>{`${title}${REPORT.status.text}`}</p>
        <ChartContainer
          title=''
          options={
            {
              title: {
                text: '',
                left: 'center'
              },
              tooltip: {
                trigger: 'item'
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
    );
  };

  const renderAlarmText = (assetsStat: Report['assetsStat'], title: string) => {
    const { minorAlarmNum, majorAlarmNum, criticalAlarmNum } = assetsStat;
    return REPORT.status.items[0].states
      .filter((s, i) => i > 0)
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
        本周共有<span className='value'>{total}</span>个{REPORT.status.items[0].title}
        处于报警状态，其中
        {renderAlarmText(assetsStat, REPORT.status.items[0].title)}；
      </span>
    );
  };

  const renderMonitoringPointsSummary = (monitoringPointsStat: Report['monitoringPointsStat']) => {
    return (
      <span>
        其中，有
        {renderAlarmText(monitoringPointsStat, REPORT.status.items[1].title)}；
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
      <section className='page'>
        <h3>{REPORT.status.title}</h3>
        {REPORT.status.items
          .filter((item) => item.page === 1)
          .map(({ title, states }, index) => {
            const data =
              index === 0
                ? [
                    report?.assetsStat.normalAlarmNum,
                    report?.assetsStat.minorAlarmNum,
                    report?.assetsStat.majorAlarmNum,
                    report?.assetsStat.criticalAlarmNum
                  ]
                : [
                    report?.monitoringPointsStat.normalAlarmNum,
                    report?.monitoringPointsStat.minorAlarmNum,
                    report?.monitoringPointsStat.majorAlarmNum,
                    report?.monitoringPointsStat.criticalAlarmNum
                  ];
            return renderStatus(title, states, data, [
              ColorHealth,
              ColorInfo,
              ColorWarn,
              ColorDanger
            ]);
          })}
      </section>
      <section className='page'>
        {REPORT.status.items
          .filter((item) => item.page === 2)
          .map(({ title, states }) =>
            renderStatus(
              title,
              states,
              [report?.devicesStat.onlineNum, report?.devicesStat.offlineNum],
              [ColorHealth, ColorOffline]
            )
          )}
        <section>
          <p>
            {report?.assetsStat &&
              verifyAlarm(report.assetsStat) &&
              renderAssetsSummary(report?.assetsStat)}
            {report?.monitoringPointsStat &&
              verifyAlarm(report.monitoringPointsStat) &&
              renderMonitoringPointsSummary(report?.monitoringPointsStat)}
            {report?.devicesStat && renderDevicesSummary(report?.devicesStat)}
          </p>
        </section>
      </section>
    </>
  );
};
