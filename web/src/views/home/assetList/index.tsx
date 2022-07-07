import { Empty, Spin } from 'antd';
import * as React from 'react';
import { AssetTypes } from '../common/constants';
import { getAssets } from './services';
import { SearchResultPage } from '../components/searchResultPage';
import { filterEmptyChildren } from '../common/treeDataHelper';
import { getProject } from '../../../utils/session';
import { AssetRow } from './props';
import '../home.css';
import { AssetTree } from './assetTree';
import { useLocation } from 'react-router-dom';
import { ActionBar } from '../components/actionBar';
import { useActionBarStatus } from '../common/useActionBarStatus';

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
        onEdit={actionStatus.handleEdit}
      />
    );
  };

  return (
    <SearchResultPage
      {...{
        actions: (
          <ActionBar
            assets={assets.items}
            {...actionStatus}
            onEdit={actionStatus.handleEdit}
            onSuccess={() => fetchAssets({ type: AssetTypes.WindTurbind.id })}
          />
        ),
        results: renderResult()
      }}
    />
  );
};

export default AssetManagement;
