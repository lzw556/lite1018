import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { AssetTypes } from '../common/constants';
import {
  convertAlarmLevelToState,
  getAlarmLevelColor,
  getAlarmStateText
} from '../common/statisticsHelper';
import { mapTreeNode } from '../common/treeDataHelper';
import { MeasurementEdit } from '../measurementList/edit';
import { sortMeasurementsByAttributes } from '../measurementList/util';
import { FlangeIcon } from '../summary/flange/icon';
import { MeasurementRow } from '../summary/measurement/props';
import { deleteMeasurement } from '../summary/measurement/services';
import { WindTurbineIcon } from '../summary/windTurbine/icon';
import { AssetEdit } from './edit';
import { AssetRow } from './props';
import { deleteAsset, getAssets } from './services';
import { sortFlangesByAttributes } from './util';

export const AssetTree: React.FC<{ assets: AssetRow[] }> = ({ assets }) => {
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();
  const [visible, setVisible] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRow>();
  const [selectedMeasurement, setSelectedMeasurement] = React.useState<MeasurementRow>();
  const [initialValues, setInitialValues] = React.useState(AssetTypes.WindTurbind);
  const [mode, setMode] = React.useState<'edit' | 'add'>();

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
                return <FlangeIcon className={`${alarmState}`} />;
              } else {
                return null;
              }
            }
          }))
        );
      setTreedata(treedata);
    }
  };

  const open = (
    initialValues?: typeof AssetTypes.WindTurbind,
    selectedAsset?: AssetRow,
    selectedMeasurement?: MeasurementRow,
    mode?: 'edit' | 'add'
  ) => {
    if (initialValues) setInitialValues(initialValues);
    setSelectedAsset(selectedAsset);
    setSelectedMeasurement(selectedMeasurement);
    setVisible(true);
    setMode(mode || 'add');
  };

  const getAssetType = (typeId: number) => {
    return Object.values(AssetTypes).find((type) => type.id === typeId);
  };

  const refresh = () => {
    getAssets({ type: AssetTypes.WindTurbind.id }).then((assets) => {
      getTreedata(assets);
    });
  };

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
            const alarmState = convertAlarmLevelToState(props.alertLevel);
            alarmText = (
              <span
                style={{
                  fontSize: 14,
                  paddingLeft: '1em',
                  color: getAlarmLevelColor(alarmState)
                }}
              >
                {getAlarmStateText(alarmState)}
              </span>
            );
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
                          open(assetType, selectedNode, undefined, 'edit');
                        } else {
                          open(undefined, undefined, selectedNode, 'edit');
                        }
                      }}
                    />
                  </Button>
                  <Popconfirm
                    title={`确定要删除${name}吗?`}
                    onConfirm={() => {
                      if (selectedNode?.type < 10000) {
                        deleteAsset(selectedNode?.id).then(() => refresh());
                      } else {
                        deleteMeasurement(selectedNode?.id).then(() => refresh());
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
                            open({ ...AssetTypes.Flange, parent_id: selectedNode?.id });
                          } else if (type === AssetTypes.Flange.id) {
                            open();
                          }
                        }}
                      />
                    </Button>
                  )}
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
      {visible &&
        (selectedNode?.type === AssetTypes.WindTurbind.id ||
          (selectedNode?.type === AssetTypes.Flange.id && mode === 'edit')) && (
          <AssetEdit
            {...{
              visible,
              onCancel: () => setVisible(false),
              id: selectedAsset?.id,
              initialValues,
              onSuccess: () => {
                refresh();
                setVisible(false);
              }
            }}
          />
        )}
      {visible &&
        (selectedNode?.type > 10000 ||
          (selectedNode?.type === AssetTypes.Flange.id && mode === 'add')) && (
          <MeasurementEdit
            {...{
              visible,
              onCancel: () => setVisible(false),
              id: selectedMeasurement?.id,
              flangeId: selectedNode?.id,
              onSuccess: () => {
                refresh();
                setVisible(false);
              }
            }}
          />
        )}
    </>
  );
};
