import { Button, Empty, message, Spin } from 'antd';
import * as React from 'react';
import { getAssets, importAssets } from './services';
import { SearchResultPage } from '../components/searchResultPage';
import { filterEmptyChildren } from '../common/treeDataHelper';
import { getProject } from '../../../utils/session';
import { AssetRow } from './props';
import '../home.css';
import { AssetTree } from './assetTree';
import { useLocation } from 'react-router-dom';
import { ActionBar } from '../components/actionBar';
import { useActionBarStatus } from '../common/useActionBarStatus';
import usePermission, { Permission } from '../../../permission/permission';
import { PlusOutlined } from '@ant-design/icons';
import { FileInput } from '../components/fileInput';
import { AssetExport } from '../components/assetExport';
import * as AppConfig from '../../../config';
import intl from 'react-intl-universal';

const AssetManagement: React.FC = () => {
  const appConfig = AppConfig.use(window.assetCategory);
  const isAssetWind = appConfig.category === 'wind';
  const { pathname, search } = useLocation();
  const [assets, setAssets] = React.useState<{
    loading: boolean;
    items: AssetRow[];
  }>({
    loading: true,
    items: []
  });
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();

  React.useEffect(() => {
    localStorage.setItem('prevProjectId', getProject());
    fetchAssets({ type: appConfig.assetType.id });
  }, [appConfig.assetType.id]);

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => {
      setAssets({
        loading: false,
        items: filterEmptyChildren(assets).filter((asset) => asset.parentId === 0)
      });
    });
  };

  const renderResult = () => {
    if (assets.loading) return <Spin />;
    if (assets.items.length === 0)
      return (
        <Empty description={intl.get('NO_ASSETS_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    return (
      <AssetTree
        assets={assets.items}
        pathname={pathname}
        search={search}
        onsuccess={() => fetchAssets({ type: appConfig.assetType.id })}
        {...actionStatus}
      />
    );
  };

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success(intl.get('IMPORTED_SUCCESSFUL'));
        fetchAssets({ type: appConfig.assetType.id });
      } else {
        message.error(
          `${intl.get('FAILED_TO_IMPORT')} ${
            res.data.msg ? intl.get(res.data.msg).d(res.data.msg) : res.data.msg
          }`
        );
      }
    });
  };

  return (
    <SearchResultPage
      {...{
        actions: hasPermission(Permission.AssetAdd) && (
          <ActionBar
            actions={[
              <Button
                key='topAssetEdit'
                type='primary'
                onClick={() => {
                  if (isAssetWind) {
                    actionStatus.handleWindEdit();
                  } else {
                    actionStatus.handleTopAssetEdit();
                  }
                }}
              >
                {intl.get('CREATE_SOMETHING', { something: intl.get(appConfig.assetType.label) })}
                <PlusOutlined />
              </Button>,
              isAssetWind && (
                <Button
                  key='flangeEidt'
                  type='primary'
                  onClick={() => actionStatus.handleFlangeEdit()}
                  disabled={assets.items.length === 0}
                >
                  {intl.get('CREATE_SOMETHING', { something: intl.get('FLANGE') })}
                  <PlusOutlined />
                </Button>
              ),
              <Button
                key='measurementEdit'
                type='primary'
                onClick={() => {
                  if (isAssetWind) {
                    actionStatus.handleAddMeasurements();
                  } else {
                    actionStatus.handleMeasurementEdit();
                  }
                }}
                disabled={
                  assets.items.filter((asset) => {
                    if (window.assetCategory === 'wind') {
                      return asset.children && asset.children.length > 0;
                    } else {
                      return true;
                    }
                  }).length === 0
                }
              >
                {intl.get('CREATE_SOMETHING', { something: intl.get('MONITORING_POINT') })}
                <PlusOutlined />
              </Button>,
              assets.items.length > 0 && <AssetExport winds={assets.items} key='export' />,
              <FileInput onUpload={handleUpload} key='upload' />
            ]}
            {...actionStatus}
            onSuccess={() => fetchAssets({ type: appConfig.assetType.id })}
          />
        ),
        results: renderResult()
      }}
    />
  );
};

export default AssetManagement;
