import React from 'react';
import { Col, Empty, Radio } from 'antd';
import intl from 'react-intl-universal';
import { generateColProps } from '../../../utils/grid';
import { Card, Grid, Tabs } from '../../../components';
import { AssetRow, StatisticBar, TabBarExtraLeftContent } from '../../asset-common';
import { Update } from './update';
import { OverviewCard } from './overviewCard';
import { Settings } from './settings';

export const Index = (props: {
  asset: AssetRow;
  onSuccess: () => void;
  onUpdateAsset: (asset: AssetRow) => void;
}) => {
  const { asset, onSuccess, onUpdateAsset } = props;
  const [type, setType] = React.useState('basic');

  const renderAssetList = (content: React.ReactNode) => {
    return (asset.children?.length ?? 0) > 0 ? (
      content
    ) : (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    );
  };

  return (
    <Tabs
      items={[
        {
          label: intl.get('ASSET'),
          key: 'asset',
          children: (
            <Grid>
              <Col span={24}>
                <Card>
                  <StatisticBar asset={asset} />
                </Card>
              </Col>
              <Col span={24}>
                {renderAssetList(
                  <Grid gutter={[12, 12]}>
                    {asset.children?.map((a) => (
                      <Col key={a.id} {...generateColProps({ md: 12, lg: 12, xl: 8, xxl: 6 })}>
                        <OverviewCard asset={a} />
                      </Col>
                    ))}
                  </Grid>
                )}
              </Col>
            </Grid>
          )
        },
        {
          label: intl.get('SETTINGS'),
          key: 'settings',
          children: (
            <Card>
              <Radio.Group
                style={{ marginBottom: 16 }}
                options={[
                  { label: intl.get('BASIC_INFORMATION'), value: 'basic' },
                  { label: intl.get('ASSET'), value: 'asset' }
                ]}
                onChange={(e) => setType(e.target.value)}
                value={type}
                optionType='button'
                buttonStyle='solid'
              />
              {type === 'basic' && <Update asset={asset} onSuccess={onSuccess} key={asset.id} />}
              {type === 'asset' && (
                <Settings
                  asset={asset}
                  onSuccess={onSuccess}
                  key={asset.id}
                  onUpdate={onUpdateAsset}
                />
              )}
            </Card>
          )
        }
      ]}
      noStyle={true}
      tabBarExtraContent={{
        left: <TabBarExtraLeftContent id={asset.id} alertLevel={asset.alertLevel} />
      }}
      tabsRighted={true}
    />
  );
};
