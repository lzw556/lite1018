import { Breadcrumb, Dropdown, Menu, Space } from 'antd';
import * as React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { MeasurementTypes } from '../common/constants';
import { getAssets } from '../assetList/services';
import { combineFinalUrl } from '../common/utils';
import { DownOutlined } from '@ant-design/icons';
import { forEachTreeNode } from '../common/treeDataHelper';
import { getMenus } from '../../../utils/session';
import { Menu as MenuPro } from '../../../types/menu';
import { Node } from '../common/treeDataHelper';
import { AssetRow } from '../assetList/props';
import * as AppConfig from '../../../config';

type BreadcrumbItemData = Node & { type?: number };
export const AssetNavigator: React.FC<
  Pick<Node, 'id' | 'parentId'> & { isForceRefresh?: number }
> = ({ id, parentId, isForceRefresh }) => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
  const [items, setItems] = React.useState<[number, boolean, Node[]][]>([]);
  const [menu, setMenu] = React.useState<MenuPro>();
  React.useEffect(() => {
    const menus = getMenus();
    for (const index in menus) {
      const menu = menus[index];
      if (menu.path === pathname) {
        setMenu(menu);
        break;
      } else {
        for (const key in menu.children) {
          const submenu = menu.children[key];
          if (submenu.path === pathname) {
            setMenu(submenu);
            break;
          }
        }
      }
    }
  }, [pathname]);
  React.useEffect(() => {
    getAssets({ type: AppConfig.use(window.assetCategory).assetType.id }).then(setAssets);
  }, [isForceRefresh]);

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
      const node = { id: 0, name: menu?.title || '总览', parentId: -1, children: assets };
      const arr: Node[] = [];
      forEachTreeNode(node, (node) => {
        arr.push(node);
        if (node.monitoringPoints && node.monitoringPoints.length > 0)
          arr.push(
            ...node.monitoringPoints.map((point) => ({ ...point, parentId: point.assetId }))
          );
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
  }, [assets, id, menu?.title, parentId]);

  const renderBreadcrumbItemDDMenu = (assets: BreadcrumbItemData[]) => {
    if (assets.length > 0) {
      return (
        <Menu style={{ overflow: 'auto', maxHeight: 600, minWidth: 200 }}>
          {assets.map((asset) => (
            <Menu.Item
              key={asset.id}
              onClick={() => {
                history.replace(pickUrlFromType(asset));
              }}
            >
              {asset.name}
            </Menu.Item>
          ))}
        </Menu>
      );
    } else {
      return <></>;
    }
  };

  const renderChildrenOfItem = (
    asset: BreadcrumbItemData,
    isLast: boolean,
    assets: BreadcrumbItemData[]
  ) => {
    const menu = renderBreadcrumbItemDDMenu(assets);
    const downIcon = <DownOutlined style={{ fontSize: '10px', cursor: 'pointer' }} />;
    if (isLast) {
      return (
        <Dropdown overlay={menu} trigger={['click']}>
          <Space>
            <span>{asset.name}</span>
            {assets.length > 0 && downIcon}
          </Space>
        </Dropdown>
      );
    } else {
      return (
        <Space>
          <Link to={pickUrlFromType(asset)}>{asset.name}</Link>
          {assets.length > 0 && (
            <Dropdown overlay={menu} trigger={['click']} placement='bottomRight'>
              {downIcon}
            </Dropdown>
          )}
        </Space>
      );
    }
  };

  const pickUrlFromType = (asset: BreadcrumbItemData) => {
    const types = [
      ...Object.values([
        AppConfig.use('default').assetType,
        AppConfig.use('wind').assetType,
        AppConfig.use('wind').assetType.secondAsset
      ]),
      ...Object.values(MeasurementTypes)
    ];
    const assetType = types.find((_type) => _type?.id === asset.type);
    return assetType
      ? combineFinalUrl(pathname, search, assetType.url, asset.id)
      : `${pathname}${search.split('/')[0]}`;
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
