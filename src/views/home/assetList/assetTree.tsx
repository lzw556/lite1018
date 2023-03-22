import { ArrowRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import HasPermission from '../../../permission';
import { Permission } from '../../../permission/permission';
import { isMobile } from '../../../utils/deviceDetection';
import { generateDatasOfMeasurement } from '../common/historyDataHelper';
import { convertAlarmLevelToState } from '../common/statisticsHelper';
import { mapTreeNode } from '../common/treeDataHelper';
import { EditFormPayload } from '../common/useActionBarStatus';
import { combineFinalUrl, getRealPoints } from '../common/utils';
import { sortMeasurementsByAttributes } from '../measurementList/util';
import { FlangeIcon } from '../summary/flange/icon';
import { MeasurementIcon } from '../summary/measurement/icon';
import { deleteMeasurement } from '../summary/measurement/services';
import { WindTurbineIcon } from '../summary/windTurbine/icon';
import { AssetRow } from './props';
import { deleteAsset } from './services';
import { sortFlangesByAttributes } from './util';
import * as AppConfig from '../../../config';
import { measurementTypes } from '../common/constants';
import intl from 'react-intl-universal';

export const AssetTree: React.FC<{
  assets: AssetRow[];
  pathname: string;
  search: string;
  onsuccess?: () => void;
  handleTopAssetEdit?: (data?: EditFormPayload) => void;
  handleWindEdit?: (data?: EditFormPayload) => void;
  handleFlangeEdit?: (data?: EditFormPayload) => void;
  handleMeasurementEdit?: (data?: EditFormPayload) => void;
  handleChildAddition?: (data?: EditFormPayload) => void;
  rootId?: number;
  handleAddMeasurements?: (data?: EditFormPayload) => void;
}> = ({
  assets,
  pathname,
  search,
  onsuccess,
  handleTopAssetEdit,
  handleFlangeEdit,
  handleWindEdit,
  handleMeasurementEdit,
  handleChildAddition,
  rootId,
  handleAddMeasurements
}) => {
  const [treedata, setTreedata] = React.useState<any>();
  const [selectedNode, setSelectedNode] = React.useState<any>();

  React.useEffect(() => {
    getTreedata(assets);
  }, [assets]);

  const getTreedata = (assets: AssetRow[]) => {
    const processNodeFn = (node: any) => {
      const points = getRealPoints(node.monitoringPoints);
      if (node.children && node.children.length > 0 && points.length > 0) {
        return { ...node, children: [...node.children, ...points] };
      } else if (node.children && node.children.length > 0) {
        return { ...node, children: sortFlangesByAttributes(node.children as AssetRow[]) };
      } else if (points.length > 0) {
        return {
          ...node,
          children: sortMeasurementsByAttributes(points),
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
              if (props.type === AppConfig.use(window.assetCategory).assetType.id) {
                return <WindTurbineIcon className={alarmState} />;
              } else if (props.type === AppConfig.use('wind').assetType.secondAsset?.id) {
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
    return Object.values([
      AppConfig.use('default').assetType,
      AppConfig.use('wind').assetType,
      AppConfig.use('wind').assetType.secondAsset
    ]).find((type) => type?.id === typeId);
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
          subpath = measurementTypes.angleDip.url;
        }
        const isRoot = selectedNode?.id === rootId && selectedNode?.type < 10000;
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
                        if (type === AppConfig.use('default').assetType.id) {
                          handleTopAssetEdit && handleTopAssetEdit({ asset: selectedNode });
                        } else if (type === AppConfig.use('wind').assetType.id) {
                          handleWindEdit && handleWindEdit({ asset: selectedNode });
                        } else if (type === AppConfig.use('wind').assetType.secondAsset?.id) {
                          handleFlangeEdit && handleFlangeEdit({ asset: selectedNode });
                        } else if (type > 10000) {
                          handleMeasurementEdit &&
                            handleMeasurementEdit({ measurement: selectedNode });
                        }
                      }}
                    />
                  </Button>
                  {!isRoot && (
                    <HasPermission value={Permission.AssetDelete}>
                      <Popconfirm
                        title={intl.get('DELETE_SOMETHING_PROMPT', { something: name })}
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
                        <Button
                          type='text'
                          danger={true}
                          size='small'
                          title={intl.get('DELETE_SOMETHING', { something: name })}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Popconfirm>
                    </HasPermission>
                  )}
                  {selectedNode?.type < 10000 && (
                    <Button type='text' size='small'>
                      <PlusOutlined
                        onClick={() => {
                          const type = selectedNode?.type;
                          if (type === AppConfig.use('wind').assetType.id) {
                            handleFlangeEdit && handleFlangeEdit({ asset: selectedNode });
                          } else if (
                            type === AppConfig.use(window.assetCategory).assetType.secondAsset?.id
                          ) {
                            handleAddMeasurements && handleAddMeasurements({ asset: selectedNode });
                          } else {
                            handleChildAddition && handleChildAddition({ asset: selectedNode });
                          }
                        }}
                      />
                    </Button>
                  )}
                </HasPermission>
                {!isRoot && (
                  <Link to={combineFinalUrl(pathname, search, subpath, selectedNode?.id)}>
                    <Button type='text' size='small'>
                      <ArrowRightOutlined />
                    </Button>
                  </Link>
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
      height={780}
    />
  );
};
