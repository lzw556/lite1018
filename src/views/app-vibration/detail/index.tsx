import React from 'react';
import { Radio } from 'antd';
import intl from 'react-intl-universal';
import { Flex } from '../../../components';
import { Tabs } from '../../../components';
import {
  AssetRow,
  MONITORING_POINT,
  MonitoringPointRow,
  TabBarExtraLeftContent
} from '../../asset-common';
import { getByType } from '../../asset-variant';
import { ActionBar } from '../actionBar';
import './style.css';
import { Index as Overview } from './overview';
import { ReadonlyPointsTable } from './readonlyPointsTable';
import { Update } from './update';
import { PointsTable } from './pointsTable';

export const Index = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdate: (m: MonitoringPointRow) => void;
}) => {
  const { asset, onSuccess } = props;
  const { id, alertLevel } = asset;
  const [type, setType] = React.useState('basic');

  return (
    <Tabs
      items={[
        {
          key: 'overview',
          label: intl.get('OVERVIEW'),
          children: <Overview asset={asset} />
        },
        {
          key: 'monitoringPointList',
          label: intl.get('MONITORING_POINT_LIST'),
          children: <ReadonlyPointsTable asset={asset} />
        },
        {
          key: 'settings',
          label: intl.get('SETTINGS'),
          children: (
            <>
              <Radio.Group
                style={{ marginBottom: 16 }}
                options={[
                  { label: intl.get('BASIC_INFORMATION'), value: 'basic' },
                  { label: intl.get(MONITORING_POINT), value: 'monitoringPoints' }
                ]}
                onChange={(e) => setType(e.target.value)}
                value={type}
                optionType='button'
                buttonStyle='solid'
              />
              {type === 'basic' && <Update asset={asset} onSuccess={onSuccess} key={asset.id} />}
              {type === 'monitoringPoints' && (
                <>
                  <Flex style={{ marginBottom: 12 }}>
                    <ActionBar {...props} />
                  </Flex>
                  <PointsTable {...props} />
                </>
              )}
            </>
          )
        }
      ]}
      tabBarExtraContent={{
        left: (
          <TabBarExtraLeftContent
            id={id}
            label={intl.get(getByType(asset.type)?.label ?? '')}
            alertLevel={alertLevel}
          />
        )
      }}
      tabsRighted={true}
    />
  );
};
