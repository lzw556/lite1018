import React from 'react';
import { Card } from 'antd';
import intl from 'react-intl-universal';
import { CreateAssetActionBar } from './components/createAssetActionBar';
import { Introduction, OverviewPage, useAssetsContext } from './components';
import { useActionBarStatus } from './common/useActionBarStatus';
import { NameValueGroups } from '../../components/name-values';
import { AssertAssetCategory, AssertOfAssetCategory, ASSET_PATHNAME } from './types';
import { useAssetCategoryChain } from '../../config/assetCategory.config';
import { AssetIcon } from './icon/icon';
import { INVALID_MONITORING_POINT } from '../monitoring-point';
import { getAssetStatistics } from './common/statisticsHelper';

export const VirtualAssetDetail = () => {
  const { root } = useAssetCategoryChain();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  return (
    <Card
      title={intl.get('ASSET_LIST')}
      extra={<CreateAssetActionBar roots={assets} refresh={refresh} actionStatus={actionStatus} />}
    >
      <OverviewPage
        {...{
          introductions: assets.map((item) => {
            const { alarmState, statistics } = getAssetStatistics(
              item.statistics,
              ['monitoringPointNum', intl.get('MONITORING_POINT')],
              ['anomalous', intl.get(INVALID_MONITORING_POINT)],
              ['deviceNum', intl.get('DEVICE')],
              ['offlineDeviceNum', intl.get('OFFLINE_DEVICE')]
            );
            return (
              <Introduction
                {...{
                  className: 'shadow',
                  count: <NameValueGroups items={statistics} col={{ span: 18 }} />,
                  title: {
                    name: item.name,
                    path: `/${ASSET_PATHNAME}/${item.id}-${item.type}`,
                    state: [`${item.id}-${item.type}`]
                  },
                  alarmState,
                  icon: {
                    svg: <AssetIcon />,
                    small: true,
                    focus: !AssertAssetCategory(root.key, AssertOfAssetCategory.IS_WIND_LIKE)
                  }
                }}
              />
            );
          })
        }}
      />
    </Card>
  );
};
