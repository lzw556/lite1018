import { Space, Tree, Typography } from 'antd';
import * as React from 'react';
import intl from 'react-intl-universal';
import { combineMonitoringPointToAsset } from '../common/utils';
import {
  AssertAssetCategory,
  AssertOfAssetCategory,
  ASSET_PATHNAME,
  AssetRow,
  VIRTUAL_ROOT_ASSET
} from '../types';
import { MonitoringPointIcon, generateDatasOfMeasurement, pickId } from '../../monitoring-point';
import { mapTree } from '../../../utils/tree';
import { convertAlarmLevelToState } from '../common/statisticsHelper';
import { AssetIcon } from '../icon/icon';
import { NodeActions } from './nodeActions';
import { FlangeIcon } from '../../flange';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { ActionBar } from '../common/actionBar';
import usePermission, { Permission } from '../../../permission/permission';
import { TowerIcon } from '../../tower';
import { useNavigate } from 'react-router-dom';
import { DataBarOfFirstProperties } from '../../device/dataBarOfFirstProperties';
import { isMobile } from '../../../utils/deviceDetection';

export const AssetTree: React.FC<{
  assets: AssetRow[];
  height?: number;
  isUsedInsideSidebar?: boolean;
  onSuccess?: (actionType?: string) => void;
  rootId?: number;
  shouldNavigateWhenClick?: boolean;
  selectedKeys?: string[];
}> = ({ assets, height, isUsedInsideSidebar = false, onSuccess, rootId, selectedKeys }) => {
  const navigate = useNavigate();
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();

  const getTreedata = React.useCallback((assets: AssetRow[]) => {
    const mixedTree = mapTree(
      [
        {
          ...VIRTUAL_ROOT_ASSET,
          children: assets,
          name: intl.get(VIRTUAL_ROOT_ASSET.name)
        } as AssetRow
      ],
      (asset) => combineMonitoringPointToAsset(asset)
    );
    const data = mapTree(mixedTree, (mix) => {
      return {
        ...mix,
        key: mix.type < 10000 ? `${mix.id}-${mix.type}` : `${mix.id}`,
        icon: (props: any) => {
          const alarmState = convertAlarmLevelToState(props.alertLevel);
          const isNodeAsset = AssertAssetCategory(mix.type ?? 0, AssertOfAssetCategory.IS_ASSET);
          const isNodeFlange = AssertAssetCategory(mix.type ?? 0, AssertOfAssetCategory.IS_FLANGE);
          const isNodeTower = AssertAssetCategory(mix.type ?? 0, AssertOfAssetCategory.IS_TOWER);
          if (isNodeAsset) {
            if (isNodeFlange) {
              return <FlangeIcon className={`${alarmState} focus`} />;
            } else if (isNodeTower) {
              return <TowerIcon className={`${alarmState} focus`} />;
            } else {
              return <AssetIcon className={`${alarmState}`} />;
            }
          } else if (mix.type > 10000) {
            return <MonitoringPointIcon className={`${alarmState} focus`} />;
          } else {
            return null;
          }
        }
      };
    });
    setTreedata(data);
  }, []);

  React.useEffect(() => {
    getTreedata(assets);
  }, [assets, getTreedata]);

  if (!treedata) return null;
  return (
    <>
      <Tree
        treeData={treedata}
        fieldNames={{ key: 'key', title: 'name' }}
        showIcon={true}
        className='asset-list-tree'
        titleRender={(props: any) => {
          const name = `${props.name}`;
          let alarmText = null;
          if (props.type > 10000) {
            const nameValues = generateDatasOfMeasurement(props);
            if (nameValues.length > 0) {
              alarmText = (
                <Space style={{ fontSize: 14, color: '#8a8e99' }}>
                  <DataBarOfFirstProperties data={nameValues} />
                </Space>
              );
            }
          }
          return (
            <Space>
              <Typography.Text
                ellipsis={true}
                style={{ maxWidth: isUsedInsideSidebar ? 110 : undefined }}
              >
                {name}
              </Typography.Text>
              {!isUsedInsideSidebar && !isMobile && alarmText}
              {selectedNode?.key === props.key &&
                props.key !== `${VIRTUAL_ROOT_ASSET.id}-${VIRTUAL_ROOT_ASSET.type}` && (
                  <NodeActions
                    id={pickId(selectedNode.id)}
                    type={selectedNode.type}
                    name={selectedNode.name}
                    onSuccess={onSuccess}
                    rootId={rootId}
                    actionStatus={actionStatus}
                  />
                )}
            </Space>
          );
        }}
        onSelect={(selectedKeys: any, e: any) => {
          setSelectedNode(e.node);
          const { id, type } = e.node;
          if (isUsedInsideSidebar) {
            navigate(`/${ASSET_PATHNAME}/${pickId(id)}-${type}`);
          }
        }}
        selectedKeys={selectedKeys}
        defaultExpandAll={true}
        height={height}
      />
      <ActionBar
        hasPermission={hasPermission(Permission.AssetAdd)}
        actions={[]}
        {...actionStatus}
        onSuccess={onSuccess}
      />
    </>
  );
};
