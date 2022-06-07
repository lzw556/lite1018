import { Breadcrumb, Dropdown, Menu, Space } from 'antd';
import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from './constants';
import { AssetRow } from './asset/props';
import { getAssets } from './asset/services';
import { Node } from './props';
import { forEachTreeNode } from './utils';
import { DownOutlined } from '@ant-design/icons';

type BreadcrumbItemData = Node & { type?: number };
export const AssetNavigator: React.FC<Pick<Node, 'id' | 'type'>> = ({ id, type }) => {
  const history = useHistory();
  const [assets, setAssets] = React.useState<AssetRow[]>([]);
  const [items, setItems] = React.useState<[number, boolean, Node[]][]>([]);
  React.useEffect(() => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then(setAssets);
  }, []);

  React.useEffect(() => {
    const findParent = (
      id: number,
      source: Node[],
      paths: { parentId: number; id: number }[],
      type?: number
    ) => {
      const item = source.find((item) => {
        if (type) {
          return item.id === id && item.type === type;
        } else {
          return item.id === id;
        }
      });
      if (item) {
        paths.push({ parentId: item.parentId, id: item.id });
        if (item.parentId !== -1) {
          findParent(item.parentId, source, paths);
        }
      }
    };
    if (assets.length > 0) {
      const node = { id: 0, name: '总览', parentId: -1, children: assets };
      const arr: Node[] = [];
      forEachTreeNode(node, (node) => {
        arr.push(node);
        if (node.monitoringPoints && node.monitoringPoints.length > 0)
          arr.push(
            ...node.monitoringPoints.map((point) => ({ ...point, parentId: point.assetId }))
          );
      });
      if (arr.length > 0) {
        const paths: { parentId: number; id: number }[] = [];
        findParent(id, arr, paths, type);
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
  }, [assets, id, type]);

  const renderBreadcrumbItemDDMenu = (assets: BreadcrumbItemData[]) => {
    if (assets.length > 0) {
      return (
        <Menu>
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
    const types = [...Object.values(AssetTypes), ...Object.values(MeasurementTypes)];
    const assetType = types.find((_type) => _type.id === asset.type);
    return assetType
      ? `${assetType.url}&id=${asset.id}`
      : `/project-overview?locale=/project-overview`;
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
