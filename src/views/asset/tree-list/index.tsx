import { Empty } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { useAssetsContext } from '../components/assetsContext';
import './tree.css';
import intl from 'react-intl-universal';
import { Outlet, useParams } from 'react-router-dom';
import { AssetSidebar } from './assetSidebar';

export default function AssetsTreeList() {
  const { id: pathId } = useParams();
  const { assets, refresh } = useAssetsContext();
  const selectedKeys = pathId ? [pathId] : undefined;

  const renderResult = () => {
    return (
      <>
        <AssetSidebar assets={assets} selectedKeys={selectedKeys} refresh={refresh} />
        <div className='asset-detail'>
          {pathId ? (
            <Outlet key={pathId} />
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
