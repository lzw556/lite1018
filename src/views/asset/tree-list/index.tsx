import { Empty } from 'antd';
import React from 'react';
import { useAssetsContext } from '../components/assetsContext';
import './tree.css';
import intl from 'react-intl-universal';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { PageWithSideBar } from '../../../components/pageWithSideBar';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { AssetTree } from './tree';
import { ASSET_PATHNAME } from '../types';
import { AssetActionBar } from '../components/assetActionBar';

export default function AssetsTreeList() {
  const { id: pathId } = useParams();
  const { assets, refresh } = useAssetsContext();
  const selectedKeys = pathId ? [pathId] : undefined;
  const actionStatus = useActionBarStatus();
  const navigate = useNavigate();

  return (
    <PageWithSideBar
      content={
        pathId ? (
          <Outlet key={pathId} />
        ) : (
          <Empty
            description={intl.get('PLEASE_SELECT_AN_ASSET')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )
      }
      sideBar={{
        body: (height) => (
          <AssetTree
            assets={assets}
            selectedKeys={selectedKeys}
            height={height}
            isUsedInsideSidebar={true}
            onSuccess={(actionType) => {
              refresh();
              if (actionType && actionType.indexOf('delete') > -1) {
                navigate(`/${ASSET_PATHNAME}`);
              }
            }}
          />
        ),
        head: <AssetActionBar roots={assets} refresh={refresh} actionStatus={actionStatus} />
      }}
    />
  );
}
