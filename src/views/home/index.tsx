import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { PageWithSideBar } from '../../components/pageWithSideBar';
import { AssetTree, ContextProvider, getVirturalAsset } from '../asset-common';
import { VirtualAssetDetail } from './virtualAssetDetail';

export default function Index() {
  const { homePathId } = getVirturalAsset();
  const { id: pathId = homePathId } = useParams();

  const renderContent = () => {
    if (pathId === homePathId) {
      return <VirtualAssetDetail />;
    } else {
      return <Outlet />;
    }
  };

  return (
    <ContextProvider>
      <PageWithSideBar
        content={renderContent()}
        sideBar={{
          body: (height) => <AssetTree height={height} selectedKeys={[pathId]} />
        }}
      />
    </ContextProvider>
  );
}
