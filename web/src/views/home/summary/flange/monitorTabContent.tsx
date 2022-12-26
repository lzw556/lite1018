import { Col, Empty, Row } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ShadowCard from '../../../../components/shadowCard';
import { AssetRow } from '../../assetList/props';
import {
  generateChartOptionsOfHistoryData,
  generateChartOptionsOfLastestData,
  generateLastestFlangeStatusChartOptions,
  HistoryData
} from '../../common/historyDataHelper';
import { combineFinalUrl, generateColProps, getRealPoints } from '../../common/utils';
import { ChartContainer } from '../../components/charts/chartContainer';
import { MeasurementRow } from '../measurement/props';
import { getData } from '../measurement/services';
import * as AppConfig from '../../../../config';

export const MonitorTabContent: React.FC<{
  measurements: MeasurementRow[];
  pathname: string;
  search: string;
  asset?: AssetRow;
}> = ({ measurements: measurementsProps, pathname, search, asset }) => {
  const history = useHistory();
  const [measurements, setMeasurements] = React.useState<MeasurementRow[]>([]);
  const [statisticOfPreload, setStatisticOfPreload] = React.useState<any>();
  const [historyDatas, setHistoryDatas] = React.useState<
    { name: string; data: HistoryData; index: number }[]
  >([]);

  React.useEffect(() => {
    setMeasurements(getRealPoints(measurementsProps));
  }, [measurementsProps]);

  React.useEffect(() => {
    if (measurements && measurements.length > 0) {
      const from = moment().startOf('day').subtract(7, 'd').utc().unix();
      const to = moment().endOf('day').utc().unix();
      setHistoryDatas([]);
      measurements.forEach(({ id, name, attributes }) => {
        getData(id, from, to).then((data) => {
          if (data.length > 0)
            setHistoryDatas((prev) => [...prev, { name, data, index: attributes?.index ?? 0 }]);
        });
      });
    }
  }, [measurements]);

  React.useEffect(() => {
    if (measurementsProps.length > measurements.length && measurements.length > 0) {
      setStatisticOfPreload(
        generateLastestFlangeStatusChartOptions(measurementsProps, measurements[0].properties[0])
      );
    } else if (historyDatas.length > 0 && measurements.length > 0) {
      setStatisticOfPreload(
        generateChartOptionsOfHistoryData(
          historyDatas.sort((prev, next) => prev.index - next.index),
          measurements[0].properties[0],
          measurements[0].type
        )
      );
    }
  }, [historyDatas, measurements, measurementsProps]);

  const renderChart = ({ options, title, style, render, clickHandler }: any) => {
    if (render) return render;
    return (
      <ChartContainer
        title={title || ''}
        options={options}
        style={style}
        clickHandler={clickHandler}
      />
    );
  };

  if (measurements.length === 0)
    return (
      <ShadowCard>
        <Empty description='没有监测点' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </ShadowCard>
    );

  const measurementType = Object.values(AppConfig.use(window.assetCategory).measurementTypes).find(
    (type) => type.id === measurements[0].type
  );
  if (!measurementType) return null;
  return (
    <Col span={24}>
      <ShadowCard>
        <Row>
          {[
            {
              title: '分布图',
              colProps: generateColProps({ xl: 12, xxl: 9 }),
              options: generateChartOptionsOfLastestData(measurements, asset?.attributes, true),
              style: { height: 550 },
              clickHandler: (paras: any, instance: any) => {
                const index = paras.value[1];
                if (measurements.length > index) {
                  history.replace(
                    combineFinalUrl(
                      pathname,
                      search,
                      AppConfig.use(window.assetCategory).measurementTypes.preload.url,
                      measurements[index].id
                    )
                  );
                }
              }
            },
            {
              title:
                measurementsProps.length > measurements.length && measurements.length > 0
                  ? ''
                  : `${measurementType.label}趋势图`,
              colProps: generateColProps({ xl: 12, xxl: 15 }),
              options: statisticOfPreload,
              style: { height: 550 },
              clickHandler: (paras: any, instance: any) => {}
            }
          ].map((chart, index) => {
            return (
              <React.Fragment key={index}>
                <Col {...chart.colProps}>{renderChart(chart)}</Col>
              </React.Fragment>
            );
          })}
        </Row>
      </ShadowCard>
    </Col>
  );
};
