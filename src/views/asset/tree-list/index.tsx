import { Empty } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { useAssetsContext } from '../components/assetsContext';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { AssetTree } from './tree';
import ShadowCard from '../../../components/shadowCard';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { CreateAssetActionBar } from '../components/createAssetActionBar';

export default function AssetsTreeList() {
  const { assets, refresh } = useAssetsContext();
  const actionStatus = useActionBarStatus();
  const { root } = useAssetCategoryChain();

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
        <AssetTree assets={assets} onSuccess={refresh} />
      </ShadowCard>
    );
  };

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('MENU_ASSET_TREE') }]}
        actions={
          <CreateAssetActionBar roots={assets} refresh={refresh} actionStatus={actionStatus} />
        }
      />
      {renderResult()}
    </Content>
  );
}
