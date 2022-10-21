import { Col, Empty, Row } from 'antd';
import * as React from 'react';
import ShadowCard from '../../../../components/shadowCard';
import * as AppConfig from '../../../../config';
import { AssetRow } from '../../assetList/props';
import { sortFlangesByAttributes } from '../../assetList/util';
import { getAssetStatistics } from '../../common/statisticsHelper';
import { combineFinalUrl, generateColProps } from '../../common/utils';
import { Introduction, IntroductionPage } from '../../components/introductionPage';
import { WindTurbineIcon } from '../windTurbine/icon';

export const MonitorTabContent: React.FC<{
  asset?: AssetRow;
  pathname: string;
  search: string;
}> = ({ asset, pathname, search }) => {
  const flanges: Introduction[] = [];
  if (asset) {
    const { children } = asset;
    if (children && children.length > 0) {
      flanges.push(
        ...sortFlangesByAttributes(children).map((item) => {
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
              path: combineFinalUrl(
                pathname,
                search,
                AppConfig.use(window.assetCategory).assetType.url,
                item.id
              )
            },
            alarmState,
            icon: { svg: <WindTurbineIcon />, small: true, focus: true },
            statistics,
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
        <Empty description='没有资产' image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
