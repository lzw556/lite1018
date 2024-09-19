import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetTree } from './tree';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { AssetActionBar } from '../components/assetActionBar';
import { ASSET_PATHNAME, AssetRow } from '../types';
import { isMobile } from '../../../utils/deviceDetection';
import { EllipsisOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';

export const AssetSidebar = ({
  assets,
  refresh,
  selectedKeys
}: {
  assets: AssetRow[];
  refresh: () => void;
  selectedKeys?: string[];
}) => {
  const actionStatus = useActionBarStatus();
  const [open, setOpen] = React.useState(false);
  const [treeHeight, setTreeHeight] = React.useState(780);
  const assetSidebarRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const setHeight = () => {
      if (assetSidebarRef && assetSidebarRef.current) {
        const height = Number(getComputedStyle(assetSidebarRef.current).height.replace('px', ''));
        setTreeHeight(height - 60);
      }
    };
    if (assets.length > 0) {
      setHeight();
      window.addEventListener('resize', setHeight);
      return () => {
        window.removeEventListener('resize', setHeight);
      };
    }
  }, [assets]);

  const side = (
    <div className='asset-sidebar' ref={assetSidebarRef}>
      <div className='asset-actions'>
        <AssetActionBar roots={assets} refresh={refresh} actionStatus={actionStatus} />
      </div>
      <div className='asset-tree' style={{ height: treeHeight }}>
        <AssetTree
          assets={assets}
          selectedKeys={selectedKeys}
          height={treeHeight}
          isUsedInsideSidebar={true}
          onSuccess={(actionType) => {
            refresh();
            if (actionType && actionType.indexOf('delete') > -1) {
              navigate(`/${ASSET_PATHNAME}`);
            }
          }}
        />
      </div>
    </div>
  );
  return isMobile ? (
    <>
      <EllipsisOutlined onClick={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)} onClick={() => setOpen(false)}>
        {side}
      </Drawer>
    </>
  ) : (
    side
  );
};
