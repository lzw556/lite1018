import { Empty } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { useAssetsContext } from '../components/assetsContext';
import './tree.css';
import intl from 'react-intl-universal';
import { Outlet, useLocation } from 'react-router-dom';
import { AssetSidebar } from './assetSidebar';

export default function AssetsTreeList() {
  const location = useLocation();
  const { assets, refresh } = useAssetsContext();
  const [path, setPath] = React.useState<string[] | undefined>();
  const selectedKeys =
    (location.pathname !== '/asset-management' ? location.state : undefined) ?? path;

  const renderResult = () => {
    return (
      <>
        <AssetSidebar
          assets={assets}
          selectedKeys={selectedKeys}
          refresh={refresh}
          setPath={setPath}
        />
        <div className='asset-detail'>
          {selectedKeys && location.pathname !== '/asset-management' ? (
            <Outlet />
          ) : (
            <Empty
              description={intl.get('PLEASE_SELECT_AN_ASSET')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </>
    );
  };

  return <Content>{renderResult()}</Content>;
}
