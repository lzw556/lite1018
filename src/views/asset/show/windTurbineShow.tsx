import { Tabs, TabsProps } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import ShadowCard from '../../../components/shadowCard';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import usePermission, { Permission } from '../../../permission/permission';
import { MONITORING_POINT_LIST } from '../../monitoring-point';
import { useAssetsContext } from '../components';
import { CreateAssetActionBar } from '../components/createAssetActionBar';
import { AssetRow } from '../types';
import { WindTurbineMonitoringPointList } from './list';
import { WindTurbineMonitor } from './monitor';
import { WindTurbineSet } from './settings';

export const WindTurbineTabs = ({
  id,
  asset,
  fetchAsset,
  actionStatus
}: {
  id: number;
  asset: AssetRow;
  fetchAsset: (id: number) => void;
  actionStatus: any;
}) => {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const { root } = useAssetCategoryChain();

  const [tabKey, setTabKey] = React.useState('');

  const items: TabsProps['items'] = [
    {
      key: 'monitor',
      label: intl.get('MONITOR'),
      children: <WindTurbineMonitor {...asset} />
    },
    {
      key: 'monitoringPointList',
      label: intl.get(MONITORING_POINT_LIST),
      children: (
        <ShadowCard>
          <WindTurbineMonitoringPointList
            wind={asset}
            onUpdate={(point) => {
              actionStatus.onMonitoringPointUpdate?.(point);
            }}
            onDeleteSuccess={() => {
              fetchAsset(id);
            }}
          />
        </ShadowCard>
      )
    }
  ];
  if (hasPermission(Permission.AssetEdit)) {
    items.push({
      key: 'settings',
      label: intl.get('SETTINGS'),
      children: (
        <WindTurbineSet
          wind={asset}
          onSuccess={() => {
            refresh();
            fetchAsset(id);
          }}
        />
      )
    });
  }
  return (
    <Tabs
      items={items}
      onChange={setTabKey}
      tabBarExtraContent={
        tabKey === 'monitoringPointList' && (
          <CreateAssetActionBar
            roots={assets}
            refresh={() => {
              fetchAsset(id);
              refresh();
            }}
            actionStatus={actionStatus}
            hiddens={[root.key]}
            needExtra={false}
            lastParent={asset}
            windId={id}
          />
        )
      }
    />
  );
};
