import { Breadcrumb, Dropdown, Space } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetRow } from '../types';
import { DownOutlined } from '@ant-design/icons';
import { forEachTreeNode, Node } from '../../../utils/tree';
import { getRealPoints } from '../../monitoring-point';
import { getPathFromType, useAssetCategoryContext, rootPathState } from '..';

type BreadcrumbItemData = Node & { type?: number };
export const AssetNavigator = ({
  id,
  parentId,
  assets,
  from = rootPathState.from
}: Pick<Node, 'id' | 'parentId'> & { assets: AssetRow[] } & {
  from: { label: string; path: string };
}) => {
  const category = useAssetCategoryContext();
  const [items, setItems] = React.useState<[number, boolean, Node[]][]>([]);

  React.useEffect(() => {
    const findParent = (id: number, source: Node[], paths: { parentId: number; id: number }[]) => {
      const item = source.filter((node) => (node.type || 0) < 10000).find((item) => item.id === id);
      if (item) {
        paths.push({ parentId: item.parentId, id: item.id });
        if (item.parentId !== -1) {
          findParent(item.parentId, source, paths);
        }
      }
    };
    if (assets.length > 0) {
      const node = {
        id: 0,
        name: from.label || '总览',
        parentId: -1,
        children: assets.filter((asset) => asset.parentId === 0)
      };
      const arr: Node[] = [];
      forEachTreeNode(node, (node) => {
        arr.push(node);
        const points = getRealPoints(node.monitoringPoints);
        if (points.length > 0)
          arr.push(...points.map((point) => ({ ...point, parentId: point.assetId })));
      });
      if (arr.length > 0) {
        const paths: { parentId: number; id: number }[] = [{ parentId, id }];
        findParent(parentId, arr, paths);
        setItems(
          paths
            .reverse()
            .map(({ parentId, id }, index) => [
              id,
              paths.length - 1 === index,
              arr.filter((item) => item.parentId === parentId)
            ])
        );
      }
    }
  }, [assets, id, from.label, parentId]);

  const renderBreadcrumbItemDDMenu = (assets: BreadcrumbItemData[]) => {
    return assets.map((asset) => ({
      key: asset.id,
      label: (
        <Link to={`${getPathFromType(category, asset.type)}${asset.id}`} state={{ from }}>
          {asset.name}
        </Link>
      )
    }));
  };

  const renderChildrenOfItem = (
    asset: BreadcrumbItemData,
    isLast: boolean,
    assets: BreadcrumbItemData[]
  ) => {
    const items = renderBreadcrumbItemDDMenu(assets);
    const downIcon = <DownOutlined style={{ fontSize: '10px', cursor: 'pointer' }} />;
    if (isLast) {
      return (
        <Dropdown menu={{ items }} trigger={['click']}>
          <Space>
            <span>{asset.name}</span>
            {assets.length > 0 && downIcon}
          </Space>
        </Dropdown>
      );
    } else {
      return (
        <Space>
          {asset.id === 0 ? (
            <Link to={from.path} state={{ from }}>
              {asset.name}
            </Link>
          ) : (
            <Link to={`${getPathFromType(category, asset.type)}${asset.id}`} state={{ from }}>
              {asset.name}
            </Link>
          )}
          {assets.length > 0 && (
            <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight'>
              {downIcon}
            </Dropdown>
          )}
        </Space>
      );
    }
  };

  const renderBreadcrumbItem = ([id, isLast, assets]: [
    id: number,
    isLast: boolean,
    assets: BreadcrumbItemData[]
  ]) => {
    const asset = assets.find((asset) => asset.id === id);
    if (!asset) return null;
    const restAssets = assets.filter((asset) => asset.id !== id);
    return (
      <Breadcrumb.Item key={asset.id} className='asset-navigator-item'>
        {renderChildrenOfItem(asset, isLast, restAssets)}
      </Breadcrumb.Item>
    );
  };

  if (items.length === 0) return null;
  return <Breadcrumb className='asset-navigator'>{items.map(renderBreadcrumbItem)}</Breadcrumb>;
};
