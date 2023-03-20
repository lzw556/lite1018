import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { AssetExport } from '../../components/assetExport';
import { FileInput } from '../../components/fileInput';
import { importAssets } from '../../services';
import { ActionBar } from '../common/actionBar';
import { useAssetsContext } from '../../components/assetsContext';
import { CREATE_GENERAL, NO_GENERALS } from '../config';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { GeneralTree } from './tree';
import usePermission, { Permission } from '../../../../permission/permission';
import { filterEmptyChildren } from '../../../../utils/tree';
import ShadowCard from '../../../../components/shadowCard';
import { getProject } from '../../../../utils/session';
import { PageTitle } from '../../../../components/pageTitle';
import { CREATE_MONITORING_POINT } from '../../../monitoring-point';

export default function GeneralsTreeList() {
  const { hasPermission } = usePermission();
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();

  const generals = filterEmptyChildren(assets).filter((asset) => asset.parentId === 0);

  const renderResult = () => {
    if (generals.length === 0)
      return <Empty description={NO_GENERALS} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <ShadowCard>
        <GeneralTree assets={generals} onSuccess={refresh} />
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
                onClick={() => actionStatus.onGeneralCreate()}
              >
                {CREATE_GENERAL}
                <PlusOutlined />
              </Button>,
              generals.length > 0 && (
                <Button
                  key='monitoring-point-create'
                  type='primary'
                  onClick={() => actionStatus.onMonitoringPointCreate()}
                >
                  {CREATE_MONITORING_POINT}
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
