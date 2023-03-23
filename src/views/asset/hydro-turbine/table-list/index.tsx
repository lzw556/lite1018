import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Empty, message, Row, Select } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { CREATE_HYDRO_TURBINE, NO_HYDRO_TURBINES, HYDRO_TURBINE } from '../config';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineMonitoringPointList } from '../show/list';
import usePermission, { Permission } from '../../../../permission/permission';
import { useStore } from '../../../../hooks/store';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import Label from '../../../../components/label';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';
import { CREATE_FLANGE, getFlanges } from '../../../flange';
import intl from 'react-intl-universal';

export default function WindTurbinesTableList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const [store, setStore] = useStore('measurementListFilters');
  const winds = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);
  const flanges = getFlanges(winds);

  const getSelectedWind = () => {
    if (winds.length > 0) {
      if (store.windTurbineId) {
        return winds.find((asset) => asset.id === store.windTurbineId);
      } else {
        return winds[0];
      }
    }
  };
  const selectedWind = getSelectedWind();

  const renderResult = () => {
    if (winds.length === 0)
      return (
        <Empty description={intl.get(NO_HYDRO_TURBINES)} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    return (
      <ShadowCard>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Label name={intl.get(HYDRO_TURBINE)}>
              <Select
                bordered={false}
                onChange={(val) => {
                  setStore((prev) => ({ ...prev, windTurbineId: val }));
                }}
                defaultValue={selectedWind?.id}
              >
                {winds.map(({ id, name }) => (
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
                onClick={actionStatus.onWindTurbineCreate}
              >
                {intl.get(CREATE_HYDRO_TURBINE)}
                <PlusOutlined />
              </Button>,
              winds.length > 0 && (
                <Button
                  key='flange-create'
                  type='primary'
                  onClick={() => actionStatus.onFlangeCreate()}
                >
                  {intl.get(CREATE_FLANGE)}
                  <PlusOutlined />
                </Button>
              ),
              flanges.length > 0 && (
                <Button
                  key='monitoring-point-create'
                  type='primary'
                  onClick={() => actionStatus.onMonitoringPointCreate()}
                >
                  {intl.get(CREATE_MONITORING_POINT)}
                  <PlusOutlined />
                </Button>
              ),
              winds.length > 0 && <AssetExport winds={winds} key='export' />,
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
