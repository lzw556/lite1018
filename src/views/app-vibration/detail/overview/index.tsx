import React from 'react';
import { Table } from 'antd';
import intl from 'react-intl-universal';
import { isMobile } from '../../../../utils/deviceDetection';
import { ChartContainer } from '../../../../components/charts/chartContainer';
import { SelfLink } from '../../../../components/selfLink';
import dayjs from '../../../../utils/dayjsUtils';
import { Language, useLocaleContext } from '../../../../localeProvider';
import { getDisplayName, getValue, roundValue } from '../../../../utils/format';
import { Asset, ASSET_PATHNAME, AssetRow, MonitoringPointRow, Point } from '../../../asset-common';
import { SettingsDetail } from '../../../asset-variant';
import { getAxisName } from '../../point/others';
import DianJi from './dianji.png';

export const Index = (props: { asset: AssetRow }) => {
  const { asset } = props;
  const { statistics, monitoringPoints = [] } = asset;
  const statisticsData = Asset.resolveStatistics(
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
  const { language } = useLocaleContext();

  return (
    <div id='vibration-asset'>
      <div className='summary'>
        {statisticsData.length > 0 && (
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
                      const series = statisticsData.find(({ name }) => itemName === name);
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
                      data: statisticsData
                    }
                  ]
                } as any
              }
              style={{ height: '100%' }}
              title='监测点统计'
            />
            <div style={{ position: 'relative' }}>
              <ChartContainer style={{ height: '100%' }} title={intl.get('ALARM_TREND')} />
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
              padding: '0 12px'
            }}
          >
            {intl.get('BASIC_INFORMATION')}
          </div>
          <SettingsDetail type={asset.type} />
        </div>
      </div>
      <div className='monitoring-points'>
        <Table
          bordered
          columns={[
            {
              dataIndex: 'name',
              title: intl.get('NAME'),
              render: (name: string, row: MonitoringPointRow) => (
                <SelfLink
                  to={`/${ASSET_PATHNAME}/${row.id}-${row.type}`}
                  state={[`${row.id}-${row.type}`]}
                  key={`${name}-${row.id}`}
                >
                  {name}
                </SelfLink>
              ),
              width: 300
            },
            ...getPropertyColumns(monitoringPoints[0], language, true),
            {
              dataIndex: 'data',
              key: 'timestamp',
              render: (d: MonitoringPointRow['data']) =>
                d?.timestamp ? dayjs(d?.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '-',
              title: intl.get('SAMPLING_TIME'),
              width: 200
            }
          ]}
          dataSource={monitoringPoints}
          size='small'
          scroll={isMobile ? { x: 1000 } : { x: 1300 }}
        />
      </div>
    </div>
  );
};

export function getPropertyColumns(
  measurement: MonitoringPointRow,
  lang: Language,
  needToFilterFirstProperties = false
) {
  if (!measurement) return [];
  const properties = Point.getPropertiesByType(measurement.properties, measurement.type).filter(
    (p) => (needToFilterFirstProperties ? p.first : true)
  );
  return properties.map(({ fields = [], key, name, precision, unit }) => {
    const children = fields.map(({ key: subKey, name }) => {
      const axisKey = subKey.replace(`${key}_`, '');
      const axisName = getAxisName(axisKey, measurement.attributes);
      return {
        key: subKey,
        render: (d: MonitoringPointRow) =>
          getValue(roundValue(d?.data?.values[subKey] as number, precision)),
        title: axisName ? intl.get(axisName) : intl.get(name),
        width: 90,
        fixed: true
      };
    });
    const title = getDisplayName({ name: intl.get(name), lang, suffix: unit });
    return children.length > 1
      ? { key, title, children }
      : {
          key,
          render: (d: MonitoringPointRow) =>
            getValue(roundValue(d?.data?.values[key] as number, precision)),
          title,
          width: 120,
          fixed: true
        };
  });
}
