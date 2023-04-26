import { Space, Tree } from 'antd';
import * as React from 'react';
import { combineMonitoringPointToAsset } from '../common/utils';
import './tree.css';
import intl from 'react-intl-universal';
import { AssertAssetCategory, AssertOfAssetCategory, AssetRow } from '../types';
import { generateDatasOfMeasurement, MonitoringPointIcon, pickId } from '../../monitoring-point';
import { mapTree } from '../../../utils/tree';
import { convertAlarmLevelToState } from '../common/statisticsHelper';
import { isMobile } from '../../../utils/deviceDetection';
import { AssetIcon } from '../icon/icon';
import { NodeActions } from './nodeActions';
import { FlangeIcon } from '../../flange';
import { useActionBarStatus } from '../common/useActionBarStatus';
import { ActionBar } from '../common/actionBar';
import usePermission, { Permission } from '../../../permission/permission';

export const AssetTree: React.FC<{
  assets: AssetRow[];
  onSuccess?: () => void;
  rootId?: number;
}> = ({ assets, onSuccess, rootId }) => {
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();
  const actionStatus = useActionBarStatus();
  const { hasPermission } = usePermission();

  const getTreedata = React.useCallback((assets: AssetRow[]) => {
    if (assets.length > 0) {
      const mixedTree = mapTree(assets, (asset) => combineMonitoringPointToAsset(asset));
      setTreedata(
        mapTree(mixedTree, (mix) => {
          return {
            ...mix,
            key: mix.type < 10000 ? `${mix.id}-${mix.type}` : `${mix.id}`,
            icon: (props: any) => {
              const alarmState = convertAlarmLevelToState(props.alertLevel);
              const isNodeAsset = AssertAssetCategory(
                mix.type ?? 0,
                AssertOfAssetCategory.IS_ASSET
              );
              const isNodeFlange = AssertAssetCategory(
                mix.type ?? 0,
                AssertOfAssetCategory.IS_FLANGE
              );
              if (isNodeAsset) {
                if (isNodeFlange) {
                  return <FlangeIcon className={`${alarmState} focus`} />;
                } else {
                  return <AssetIcon className={`${alarmState}`} />;
                }
              } else {
                return <MonitoringPointIcon className={`${alarmState} focus`} />;
              }
            }
          };
        })
      );
    }
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
                  {nameValues.map(({ name, value }) => `${intl.get(name)}: ${value}`)}
                </Space>
              );
            }
          }

          return (
            <Space>
              {name}
              {!isMobile && alarmText}
              {selectedNode?.key === props.key && (
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
        }}
        defaultExpandAll={true}
        height={780}
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
