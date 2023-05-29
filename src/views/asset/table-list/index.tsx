import { Col, Empty, Row, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { useAssetsContext } from '../components/assetsContext';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineMonitoringPointList } from '../show/list';
import { useStore } from '../../../hooks/store';
import ShadowCard from '../../../components/shadowCard';
import Label from '../../../components/label';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { CreateAssetActionBar } from '../components/createAssetActionBar';
import { isMobile } from '../../../utils/deviceDetection';

export default function AssetsTableList() {
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const [store, setStore] = useStore('measurementListFilters');
  const { root } = useAssetCategoryChain();

  const getSelectedWind = () => {
    if (assets.length > 0) {
      if (store.windTurbineId) {
        return assets.find((asset) => asset.id === store.windTurbineId);
      } else {
        return assets[0];
      }
    }
  };
  const selectedWind = getSelectedWind();

  const renderResult = () => {
    if (assets.length === 0) {
      return (
        <Empty
          description={intl.get('NO_ASSET_PROMPT', {
            assetTypeLabel: intl.get(root.label).toLowerCase()
          })}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <ShadowCard>
        <Row gutter={[16, 16]}>
          <Col span={isMobile ? 24 : 6}>
            <Label name={intl.get(root.label)}>
              <Select
                bordered={false}
                onChange={(val) => {
                  setStore((prev) => ({ ...prev, windTurbineId: val }));
                }}
                defaultValue={selectedWind?.id}
              >
                {assets.map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Label>
          </Col>
          {selectedWind && (
            <Col span={24}>
              <WindTurbineMonitoringPointList
                wind={selectedWind}
                onUpdate={(point) => actionStatus.onMonitoringPointUpdate(point)}
                onDeleteSuccess={() => refresh()}
              />
            </Col>
          )}
        </Row>
      </ShadowCard>
    );
  };

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('ASSET_LIST') }]}
        actions={
          <CreateAssetActionBar roots={assets} refresh={refresh} actionStatus={actionStatus} />
        }
      />
      {renderResult()}
    </Content>
  );
}
