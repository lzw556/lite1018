import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Empty, message, Row, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { useActionBarStatus } from '../common/useActionBarStatus';
import usePermission, { Permission } from '../../../../permission/permission';
import { useStore } from '../../../../hooks/store';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import Label from '../../../../components/label';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';
import { getAreaAssets } from '../common/utils';
import { AREA, CREATE_AREA, CREATE_AREA_ASSET, NO_AREAS } from '../config';
import { AreaMonitoringPointList } from '../show/list';
import intl from 'react-intl-universal';

export default function CorrosionsTableList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const [store, setStore] = useStore('measurementListFilters');
  const areas = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);
  const areaAssets = getAreaAssets(areas);

  const getSelectedArea = () => {
    if (areas.length > 0) {
      if (store.windTurbineId) {
        return areas.find((asset) => asset.id === store.windTurbineId);
      } else {
        return areas[0];
      }
    }
  };
  const selectedArea = getSelectedArea();

  const renderResult = () => {
    if (areas.length === 0)
      return <Empty description={intl.get(NO_AREAS)} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <ShadowCard>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Label name={intl.get(AREA)}>
              <Select
                bordered={false}
                onChange={(val) => {
                  setStore((prev) => ({ ...prev, windTurbineId: val }));
                }}
                defaultValue={selectedArea?.id}
              >
                {areas.map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Label>
          </Col>
          {selectedArea && (
            <Col span={24}>
              <AreaMonitoringPointList
                wind={selectedArea}
                onUpdate={(point) => actionStatus.onMonitoringPointUpdate(point)}
                onDeleteSuccess={() => refresh()}
              />
            </Col>
          )}
        </Row>
      </ShadowCard>
    );
  };

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success(intl.get('IMPORTED_SUCCESSFUL'));
        refresh();
      } else {
        message.error(`${intl.get('FAILED_TO_IMPORT')}: ${res.data.msg}`);
      }
    });
  };

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('ASSET_LIST') }]}
        actions={
          <ActionBar
            hasPermission={hasPermission(Permission.AssetAdd)}
            actions={[
              <Button
                key='wind-turbine-create'
                type='primary'
                onClick={() => actionStatus.onAreaCreate()}
              >
                {intl.get(CREATE_AREA)}
                <PlusOutlined />
              </Button>,
              areas.length > 0 && (
                <Button
                  key='flange-create'
                  type='primary'
                  onClick={() => actionStatus.onAreaAssetCreate()}
                >
                  {intl.get(CREATE_AREA_ASSET)}
                  <PlusOutlined />
                </Button>
              ),
              areaAssets.length > 0 && (
                <Button
                  key='monitoring-point-create'
                  type='primary'
                  onClick={() => actionStatus.onMonitoringPointCreate()}
                >
                  {intl.get(CREATE_MONITORING_POINT)}
                  <PlusOutlined />
                </Button>
              ),
              areas.length > 0 && <AssetExport winds={areas} key='export' />,
              <FileInput onUpload={handleUpload} key='upload' />
            ]}
            {...actionStatus}
            onSuccess={() => refresh()}
          />
        }
      />
      {renderResult()}
    </Content>
  );
}
