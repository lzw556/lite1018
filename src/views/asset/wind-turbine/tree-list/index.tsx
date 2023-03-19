import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { CREATE_WIND_TURBINE, NO_WIND_TURBINES } from '../common/types';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { WindTurbineTree } from './tree';
import usePermission, { Permission } from '../../../../permission/permission';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';
import { CREATE_FLANGE, getFlanges } from '../../../flange';

export default function WindTurbinesTreeList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();

  const winds = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);
  const flanges = getFlanges(winds);

  const renderResult = () => {
    if (winds.length === 0)
      return <Empty description={NO_WIND_TURBINES} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <ShadowCard>
        <WindTurbineTree assets={winds} onSuccess={refresh} />
      </ShadowCard>
    );
  };

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success('导入成功');
        refresh();
      } else {
        message.error(`导入失败: ${res.data.msg}`);
      }
    });
  };

  return (
    <Content>
      <PageTitle
        items={[{ title: '资产树' }]}
        actions={
          <ActionBar
            hasPermission={hasPermission(Permission.AssetAdd)}
            actions={[
              <Button
                key='wind-turbine-create'
                type='primary'
                onClick={actionStatus.onWindTurbineCreate}
              >
                {CREATE_WIND_TURBINE}
                <PlusOutlined />
              </Button>,
              winds.length > 0 && (
                <Button
                  key='flange-create'
                  type='primary'
                  onClick={() => actionStatus.onFlangeCreate()}
                >
                  {CREATE_FLANGE}
                  <PlusOutlined />
                </Button>
              ),
              flanges.length > 0 && (
                <Button
                  key='monitoring-point-create'
                  type='primary'
                  onClick={() => actionStatus.onMonitoringPointCreate()}
                >
                  {CREATE_MONITORING_POINT}
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
