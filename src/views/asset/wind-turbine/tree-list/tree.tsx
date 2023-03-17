import { ArrowRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROOT_ASSETS } from '../../../../config/assetCategory.config';
import HasPermission from '../../../../permission';
import { Permission } from '../../../../permission/permission';
import { isMobile } from '../../../../utils/deviceDetection';
import { mapTreeNode } from '../../../../utils/tree';
import { FlangeIcon, FLANGE_ASSET_TYPE_ID, getFlanges } from '../../../flange';
import {
  MonitoringPointIcon,
  deleteMeasurement,
  MonitoringPointRow,
  generateDatasOfMeasurement,
  getRealPoints
} from '../../../monitoring-point';
import { convertAlarmLevelToState } from '../../common/statisticsHelper';
import { useAssetCategoryContext } from '../../components/assetCategoryContext';
import { deleteAsset } from '../../services';
import { AssetRow } from '../../types';
import { getPathFromType, sortAssetsByIndex } from '../common/utils';
import { WindTurbineIcon } from '../icon/icon';
import './tree.css';

export const WindTurbineTree: React.FC<{
  assets: AssetRow[];
  onWindTurbineUpdate?: (asset: AssetRow) => void;
  onFlangeCreate?: (paras: AssetRow[] | number) => void;
  onFlangeUpdate?: (flange: AssetRow, windTurbines: AssetRow[]) => void;
  onMonitoringPointCreate?: (paras: AssetRow[] | AssetRow) => void;
  onMonitoringPointUpdate?: (monitoringPoint: MonitoringPointRow, flanges: AssetRow[]) => void;
  onsuccess?: () => void;
}> = ({
  assets,
  onWindTurbineUpdate,
  onFlangeCreate,
  onFlangeUpdate,
  onMonitoringPointCreate,
  onMonitoringPointUpdate,
  onsuccess
}) => {
  const { state } = useLocation();
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();
  const category = useAssetCategoryContext();
  const WIND_TURBINE_ASSET_TYPE_ID = ROOT_ASSETS.get('windTurbine');

  const getTreedata = React.useCallback(
    (assets: AssetRow[]) => {
      const processNodeFn = (node: any) => {
        const points = getRealPoints(node.monitoringPoints);
        const children = node.children ?? [];
        if (children.length > 0 && points.length > 0) {
          return { ...node, children: [...children, ...points] };
        } else if (node.children && node.children.length > 0) {
          return { ...node, children: sortAssetsByIndex(children as AssetRow[]) };
        } else if (points.length > 0) {
          return {
            ...node,
            children: points,
            monitoringPoints: []
          };
        } else {
          return node;
        }
      };
      if (assets.length > 0) {
        const copy = cloneDeep(assets);
        const treedata = copy
          .map((node: any) => mapTreeNode(node, processNodeFn))
          .map((node) =>
            mapTreeNode(node, (node) => ({
              ...node,
              key: `${node.id}-${node.type}`,
              icon: (props: any) => {
                const alarmState = convertAlarmLevelToState(props.alertLevel);
                if (props.type === WIND_TURBINE_ASSET_TYPE_ID) {
                  return <WindTurbineIcon className={alarmState} />;
                } else if (props.type === FLANGE_ASSET_TYPE_ID) {
                  return <FlangeIcon className={`${alarmState} focus`} />;
                } else {
                  return <MonitoringPointIcon className={`${alarmState} focus`} />;
                }
              }
            }))
          );
        setTreedata(treedata);
      }
    },
    [WIND_TURBINE_ASSET_TYPE_ID]
  );

  React.useEffect(() => {
    getTreedata(assets);
  }, [assets, getTreedata]);

  if (!treedata) return null;
  return (
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
                {nameValues.map(({ name, value }) => `${name}: ${value}`)}
              </Space>
            );
          }
        }

        return (
          <Space>
            {name}
            {!isMobile && alarmText}
            {selectedNode?.key === props.key && (
              <>
                <HasPermission value={Permission.AssetAdd}>
                  <Button type='text' size='small'>
                    <EditOutlined
                      onClick={() => {
                        const type = selectedNode?.type;
                        if (type === WIND_TURBINE_ASSET_TYPE_ID) {
                          onWindTurbineUpdate?.(selectedNode);
                        } else if (type === FLANGE_ASSET_TYPE_ID) {
                          onFlangeUpdate?.(selectedNode, assets);
                        } else {
                          onMonitoringPointUpdate?.(selectedNode, getFlanges(assets));
                        }
                      }}
                    />
                  </Button>
                  <HasPermission value={Permission.AssetDelete}>
                    <Popconfirm
                      title={`确定要删除${name}吗?`}
                      onConfirm={() => {
                        if (selectedNode?.type < 10000) {
                          deleteAsset(selectedNode?.id).then(() => {
                            if (onsuccess) onsuccess();
                          });
                        } else {
                          deleteMeasurement(selectedNode?.id).then(() => {
                            if (onsuccess) onsuccess();
                          });
                        }
                      }}
                    >
                      <Button type='text' danger={true} size='small' title={`删除${name}`}>
                        <DeleteOutlined />
                      </Button>
                    </Popconfirm>
                  </HasPermission>
                  {selectedNode?.type < 10000 && (
                    <Button type='text' size='small'>
                      <PlusOutlined
                        onClick={() => {
                          const type = selectedNode?.type;
                          if (type === WIND_TURBINE_ASSET_TYPE_ID) {
                            onFlangeCreate?.(selectedNode?.id);
                          } else if (type === FLANGE_ASSET_TYPE_ID) {
                            onMonitoringPointCreate?.(selectedNode);
                          }
                        }}
                      />
                    </Button>
                  )}
                </HasPermission>
                <Link
                  to={`${getPathFromType(category, selectedNode?.type)}${selectedNode?.id}`}
                  state={state}
                >
                  <Button type='text' size='small'>
                    <ArrowRightOutlined />
                  </Button>
                </Link>
              </>
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
  );
};
