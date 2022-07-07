import { ArrowRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AssetTypes, MeasurementTypes } from '../common/constants';
import { generateDatasOfMeasurement } from '../common/historyDataHelper';
import { convertAlarmLevelToState } from '../common/statisticsHelper';
import { mapTreeNode } from '../common/treeDataHelper';
import { combineFinalUrl } from '../common/utils';
import { sortMeasurementsByAttributes } from '../measurementList/util';
import { FlangeIcon } from '../summary/flange/icon';
import { MeasurementIcon } from '../summary/measurement/icon';
import { MeasurementRow } from '../summary/measurement/props';
import { deleteMeasurement } from '../summary/measurement/services';
import { WindTurbineIcon } from '../summary/windTurbine/icon';
import { AssetRow } from './props';
import { deleteAsset } from './services';
import { sortFlangesByAttributes } from './util';

export const AssetTree: React.FC<{
  assets: AssetRow[];
  pathname: string;
  search: string;
  onsuccess?: () => void;
  onEdit?: (
    selectedMeasurement?: MeasurementRow,
    selectedAsset?: AssetRow,
    initialValues?: typeof AssetTypes.WindTurbind,
    flangeId?: number
  ) => void;
}> = ({ assets, pathname, search, onsuccess, onEdit }) => {
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();

  React.useEffect(() => {
    getTreedata(assets);
  }, [assets]);

  const getTreedata = (assets: AssetRow[]) => {
    if (assets.length > 0) {
      const copy = cloneDeep(assets);
      const treedata = copy
        .map((node) =>
          mapTreeNode(node, (node) => {
            if (node.children && node.children.length > 0) {
              return { ...node, children: sortFlangesByAttributes(node.children as AssetRow[]) };
            } else if (node.monitoringPoints && node.monitoringPoints.length > 0) {
              return {
                ...node,
                children: sortMeasurementsByAttributes(node.monitoringPoints),
                monitoringPoints: []
              };
            } else {
              return node;
            }
          })
        )
        .map((node) =>
          mapTreeNode(node, (node) => ({
            ...node,
            key: `${node.id}-${node.type}`,
            icon: (props: any) => {
              const alarmState = convertAlarmLevelToState(props.alertLevel);
              if (props.type === AssetTypes.WindTurbind.id) {
                return <WindTurbineIcon className={alarmState} />;
              } else if (props.type === AssetTypes.Flange.id) {
                return <FlangeIcon className={`${alarmState} focus`} />;
              } else {
                return <MeasurementIcon className={`${alarmState} focus`} />;
              }
            }
          }))
        );
      setTreedata(treedata);
    }
  };

  const getAssetType = (typeId: number) => {
    return Object.values(AssetTypes).find((type) => type.id === typeId);
  };

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
        let subpath = '';
        const assetType = getAssetType(selectedNode?.type);
        if (selectedNode?.type < 10000) {
          if (assetType) subpath = assetType.url;
        } else {
          subpath = MeasurementTypes.preload.url;
        }
        return (
          <Space>
            {name}
            {alarmText}
            {selectedNode?.key === props.key && (
              <>
                <Button type='text' size='small'>
                  <EditOutlined
                    onClick={() => {
                      const type = selectedNode?.type;
                      const assetType = getAssetType(type);
                      if (type < 10000) {
                        if (onEdit) onEdit(undefined, selectedNode, assetType);
                      } else {
                        if (onEdit) onEdit(selectedNode, undefined, undefined);
                      }
                    }}
                  />
                </Button>
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
                {selectedNode?.type < 10000 && (
                  <Button type='text' size='small'>
                    <PlusOutlined
                      onClick={() => {
                        const type = selectedNode?.type;
                        if (type === AssetTypes.WindTurbind.id) {
                          if (onEdit)
                            onEdit(undefined, undefined, {
                              ...AssetTypes.Flange,
                              parent_id: selectedNode?.id
                            });
                        } else if (type === AssetTypes.Flange.id) {
                          if (onEdit) onEdit(undefined, undefined, undefined, selectedNode?.id);
                        }
                      }}
                    />
                  </Button>
                )}
                <Link to={combineFinalUrl(pathname, search, subpath, selectedNode?.id)}>
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
    />
  );
};
