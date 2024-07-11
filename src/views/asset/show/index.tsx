import { Col, Row, Spin } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';
import { AssetAlarmStatistic, useAssetsContext } from '../components';
import { AssertAssetCategory, AssertOfAssetCategory, AssetRow } from '../types';
import { getAsset } from '../services';
import ShadowCard from '../../../components/shadowCard';
import { AssetTree } from '../tree-list/tree';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineTabs } from './windTurbineShow';
import intl from 'react-intl-universal';

export default function WindTurbineShow() {
  const { id } = useParams();
  const { refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const [asset, setAsset] = React.useState<AssetRow>();
  const [loading, setLoading] = React.useState(true);

  const fetchAsset = (id: number) => {
    getAsset(id).then((asset) => {
      setLoading(false);
      setAsset(asset);
    });
  };

  React.useEffect(() => {
    fetchAsset(Number(id));
  }, [id]);

  if (loading) return <Spin />;
  if (asset === undefined) return <p>{intl.get('PARAMETER_ERROR_PROMPT')}</p>;

  const isAssetWind = AssertAssetCategory(asset.type, AssertOfAssetCategory.IS_WIND_LIKE);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <AssetAlarmStatistic {...asset} />
        {isAssetWind && (
          <WindTurbineTabs
            id={Number(id)}
            asset={asset}
            actionStatus={actionStatus}
            fetchAsset={fetchAsset}
          />
        )}
      </Col>
      <Col span={24}>
        {!isAssetWind && (
          <ShadowCard>
            <AssetTree
              assets={asset ? [asset] : []}
              {...actionStatus}
              rootId={asset.id}
              onSuccess={() => {
                refresh();
                fetchAsset(Number(id));
              }}
            />
          </ShadowCard>
        )}
      </Col>
    </Row>
  );
}
