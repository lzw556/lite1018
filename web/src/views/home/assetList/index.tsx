import { Button, Empty, message, Spin } from 'antd';
import * as React from 'react';
import { AssetTypes } from '../common/constants';
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

const AssetManagement: React.FC = () => {
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
    fetchAssets({ type: AssetTypes.WindTurbind.id });
  }, []);

  const fetchAssets = (filters?: Pick<AssetRow, 'type'>) => {
    setAssets((prev) => ({ ...prev, loading: true }));
    getAssets(filters).then((assets) => {
      setAssets({ loading: false, items: filterEmptyChildren(assets) });
    });
  };

  const renderResult = () => {
    if (assets.loading) return <Spin />;
    if (assets.items.length === 0)
      return <Empty description='没有资产' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <AssetTree
        assets={assets.items}
        pathname={pathname}
        search={search}
        onsuccess={() => fetchAssets({ type: AssetTypes.WindTurbind.id })}
        {...actionStatus}
      />
    );
  };

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success('导入成功');
        fetchAssets({ type: AssetTypes.WindTurbind.id });
      } else {
        message.error(`导入失败: ${res.data.msg}`);
      }
    });
  };

  return (
    <SearchResultPage
      {...{
        actions: hasPermission(Permission.AssetAdd) && (
          <ActionBar
            actions={[
              <Button type='primary' onClick={() => actionStatus.handleWindEdit()}>
                添加风机
                <PlusOutlined />
              </Button>,
              <Button
                type='primary'
                onClick={() => actionStatus.handleFlangeEdit()}
                disabled={assets.items.length === 0}
              >
                添加法兰
                <PlusOutlined />
              </Button>,
              <Button
                type='primary'
                onClick={() => actionStatus.handleMeasurementEdit()}
                disabled={
                  assets.items.filter((asset) => asset.children && asset.children.length > 0)
                    .length === 0
                }
              >
                添加监测点
                <PlusOutlined />
              </Button>,
              assets.items.length > 0 && <AssetExport winds={assets.items} />,
              <FileInput onUpload={handleUpload} />
            ]}
            {...actionStatus}
            onSuccess={() => fetchAssets({ type: AssetTypes.WindTurbind.id })}
          />
        ),
        results: renderResult()
      }}
    />
  );
};

export default AssetManagement;
