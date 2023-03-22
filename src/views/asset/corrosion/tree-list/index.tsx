import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { CREATE_AREA, CREATE_AREA_ASSET, NO_AREAS } from '../config';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { AreaTree } from './tree';
import usePermission, { Permission } from '../../../../permission/permission';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';
import { getAreaAssets } from '../common/utils';
import intl from 'react-intl-universal';

export default function AreasTreeList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();

  const generals = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);
  const areaAssets = getAreaAssets(assets);

  const renderResult = () => {
    if (generals.length === 0)
      return <Empty description={intl.get(NO_AREAS)} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <ShadowCard>
        <AreaTree assets={generals} onSuccess={refresh} />
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
                onClick={() => actionStatus.onAreaCreate()}
              >
                {intl.get(CREATE_AREA)}
                <PlusOutlined />
              </Button>,
              generals.length > 0 && (
                <Button
                  key='pipe-create'
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
              generals.length > 0 && <AssetExport winds={generals} key='export' />,
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
