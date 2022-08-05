import { Col, Empty, Row } from 'antd';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ShadowCard from '../../../../components/shadowCard';
import { AssetRow } from '../../assetList/props';
import { sortFlangesByAttributes } from '../../assetList/util';
import { AssetTypes, MeasurementTypes } from '../../common/constants';
import { generateChartOptionsOfLastestData } from '../../common/historyDataHelper';
import { getAssetStatistics } from '../../common/statisticsHelper';
import { combineFinalUrl, generateColProps } from '../../common/utils';
import { Introduction, IntroductionPage } from '../../components/introductionPage';
import { FlangeIcon } from '../flange/icon';
import { MeasurementRow } from '../measurement/props';

export const MonitorTabContent: React.FC<{
  asset?: AssetRow;
  pathname: string;
  search: string;
}> = ({ asset, pathname, search }) => {
  const history = useHistory();
  const measurements: MeasurementRow[] = [];
  const flanges: Introduction[] = [];
  if (asset) {
    const { children } = asset;
    if (children && children.length > 0) {
      flanges.push(
        ...sortFlangesByAttributes(children).map((item) => {
          let chart: any = null;
          if (item.monitoringPoints && item.monitoringPoints.length > 0) {
            chart = {
              title: '',
              options: generateChartOptionsOfLastestData(item.monitoringPoints, item.attributes),
              style: { left: '-24px', top: '-20px', height: 400 },
              clickHandler: (paras: any) => {
                const index = paras.value[1];
                if (item.monitoringPoints && item.monitoringPoints.length > index) {
                  history.replace(
                    combineFinalUrl(
                      pathname,
                      search,
                      MeasurementTypes.preload.url,
                      item.monitoringPoints[index].id
                    )
                  );
                }
              }
            };
            measurements.push(
              ...item.monitoringPoints.map((point) => ({ ...point, assetName: item.name }))
            );
          }
          const { alarmState, statistics } = getAssetStatistics(
            item.statistics,
            'monitoringPointNum',
            ['anomalous', '异常监测点'],
            'deviceNum',
            'offlineDeviceNum'
          );
          return {
            parentId: item.parentId,
            id: item.id,
            title: {
              name: item.name,
              path: combineFinalUrl(pathname, search, AssetTypes.Flange.url, item.id)
            },
            alarmState,
            icon: { svg: <FlangeIcon />, small: true, focus: true },
            statistics,
            chart,
            colProps: generateColProps({ md: 12, lg: 12, xl: 12, xxl: 8 }),
            statisticsLayout: 'horizontal'
          };
        })
      );
    }
  }

  if (flanges.length === 0)
    return (
      <ShadowCard>
        <Empty description='没有法兰' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </ShadowCard>
    );

  return (
    <Col span={24}>
      <Row gutter={[16, 16]}>
        {flanges.map((des) => (
          <Col {...des.colProps} key={des.id}>
            <IntroductionPage {...des} />
          </Col>
        ))}
      </Row>
    </Col>
  );
};
