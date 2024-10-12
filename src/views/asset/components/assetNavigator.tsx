import { Breadcrumb, Dropdown, MenuProps, Space } from 'antd';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AssertAssetCategory,
  AssertOfAssetCategory,
  AssetRow,
  AssetTreeNode,
  ASSET_PATHNAME,
  isAssetCategoryKey
} from '../types';
import { DownOutlined } from '@ant-design/icons';
import { mapTree, tree2List } from '../../../utils/tree';
import { MONITORING_POINT_PATHNAME, pickId } from '../../monitoring-point';
import intl from 'react-intl-universal';
import { FLANGE_PATHNAME } from '../../flange';
import { combineMonitoringPointToAsset } from '../common/utils';
import { useAssetsContext } from './assetsContext';
import { TOWER_PATHNAME } from '../../tower';
import { SelfLink } from '../../../components/selfLink';

export type TreeFlatListItem = AssetTreeNode & { path: number[] };

export const AssetNavigator = ({ id }: { id: string | number }) => {
  const [items, setItems] = React.useState<any>([]);
  const { assets } = useAssetsContext();
  const { state } = useLocation();
  const from = state?.from;

  React.useEffect(() => {
    if (assets.length > 0) {
      const root = {
        id: 0,
        name: from.label || intl.get('OVERVIEW'),
        children: assets
      } as AssetRow;
      const list: TreeFlatListItem[] = tree2List(
        mapTree([root], (node) => combineMonitoringPointToAsset(node))
      );
      if (list.length > 0) {
        const paths = list.find((item) => item.id === id)?.path;
        setItems(
          paths
            ?.map((id) => list.find((item) => id === item.id))
            .map((mix, index) => ({
              title: mix && (
                <BreadcrumbItemTitle isLast={paths.length - 1 === index} mix={mix} list={list} />
              )
            }))
        );
      }
    }
  }, [id, from, assets]);

  if (items === undefined || items.length === 0) return null;
  return <Breadcrumb items={items} />;
};

function BreadcrumbItemTitle({
  mix,
  isLast,
  list
}: {
  isLast: boolean;
  mix: TreeFlatListItem;
  list: TreeFlatListItem[];
}) {
  const { id, name, parentId } = mix;
  const downIcon = <DownOutlined style={{ fontSize: '10px', cursor: 'pointer' }} />;
  const siblings = list.filter((item) => item.id !== id && item.parentId === parentId);
  const items: MenuProps['items'] = siblings.map((mix: any) => ({
    key: mix.id,
    label: <ItemLink {...mix} />
  }));
  if (isLast) {
    if (siblings.length > 0) {
      return (
        <Dropdown menu={{ items }} trigger={['click']}>
          <Space>
            <span>{name}</span>
            {downIcon}
          </Space>
        </Dropdown>
      );
    } else {
      return (
        <Space>
          <span>{name}</span>
        </Space>
      );
    }
  } else {
    return (
      <Space>
        <ItemLink {...mix} />
        {siblings.length > 0 && id !== 0 && (
          <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight'>
            {downIcon}
          </Dropdown>
        )}
      </Space>
    );
  }
}

function ItemLink({ id, type, name }: TreeFlatListItem) {
  const { state } = useLocation();
  const from = state?.from;
  return (
    <SelfLink to={id === 0 ? from.path : `${getPathFromType(type)}${pickId(id)}`} state={{ from }}>
      {name}
    </SelfLink>
  );
}

export function getPathFromType(type?: number) {
  let pathname = null;
  if (isAssetCategoryKey(type)) {
    if (AssertAssetCategory(type ?? 0, AssertOfAssetCategory.IS_FLANGE)) {
      pathname = `/${FLANGE_PATHNAME}/`;
    } else if (AssertAssetCategory(type ?? 0, AssertOfAssetCategory.IS_TOWER)) {
      pathname = `/${TOWER_PATHNAME}/`;
    } else {
      pathname = `/${ASSET_PATHNAME}/`;
    }
  } else {
    pathname = `/${MONITORING_POINT_PATHNAME}/`;
  }
  return pathname;
}
