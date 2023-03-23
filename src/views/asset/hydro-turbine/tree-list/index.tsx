import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { CREATE_HYDRO_TURBINE, NO_HYDRO_TURBINES } from '../config';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineTree } from './tree';
import usePermission, { Permission } from '../../../../permission/permission';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';
import { CREATE_FLANGE, getFlanges } from '../../../flange';
import intl from 'react-intl-universal';

export default function WindTurbinesTreeList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();

  const winds = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);
  const flanges = getFlanges(winds);

  const renderResult = () => {
    if (winds.length === 0)
      return (
        <Empty description={intl.get(NO_HYDRO_TURBINES)} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    return (
      <ShadowCard>
        <WindTurbineTree assets={winds} onSuccess={refresh} />
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
        items={[{ title: intl.get('MENU_ASSET_TREE') }]}
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
