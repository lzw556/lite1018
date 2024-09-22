import { Col, Row } from 'antd';
import React from 'react';
import { AssetAlarmStatistic, useAssetsContext } from '../components';
import { AssertAssetCategory, AssertOfAssetCategory, AssetRow } from '../types';
import ShadowCard from '../../../components/shadowCard';
import { AssetTree } from '../tree-list/tree';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineTabs } from './windTurbineShow';
import { VibrationAsset } from '../vibration-asset/vibrationAsset';

export default function WindTurbineShow({
  asset,
  fetchAsset
}: {
  asset: AssetRow;
  fetchAsset: (id: number) => void;
}) {
  const { id } = asset;
  const { refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const isAssetWind = AssertAssetCategory(asset.type, AssertOfAssetCategory.IS_WIND_LIKE);
  const isVibration = AssertAssetCategory(asset.type, AssertOfAssetCategory.IS_VIBRATION);

  if (isVibration) {
    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <VibrationAsset asset={asset} refresh={refresh} />
        </Col>
      </Row>
    );
  } else {
    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <AssetAlarmStatistic {...asset} />
          {isAssetWind && (
            <WindTurbineTabs
              id={id}
              asset={asset}
              actionStatus={actionStatus}
              fetchAsset={fetchAsset}
            />
          )}
        </Col>
        {!isAssetWind && (
          <Col span={24}>
            <ShadowCard>
              <AssetTree
                assets={asset ? [asset] : []}
                {...actionStatus}
                rootId={asset.id}
                onSuccess={() => {
                  refresh();
                  fetchAsset(id);
                }}
              />
            </ShadowCard>
          </Col>
        )}
      </Row>
    );
  }
}
