import { Empty, Modal, ModalProps, Spin, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { ROOT_ASSETS } from '../../../config/assetCategory.config';
import { filterEmptyChildren, mapTreeNode } from '../../../utils/tree';
import { useAssetCategoryContext } from '../../asset';
import { getAssets } from '../../asset/services';
import { AssetRow } from '../../asset/types';
import { sortFlangesByAttributes } from '../../flange';
import {
  MonitoringPointRow,
  UPDATE_MONITORING_POINT,
  sortMonitoringPointByAttributes
} from '../../monitoring-point';
import { bindMeasurementsToAlarmRule2 } from './services';
import { AlarmRule } from './types';

export const MeasurementBindBase: React.FC<
  ModalProps & { selectedRow: AlarmRule } & { onSuccess: () => void }
> = (props) => {
  const category = useAssetCategoryContext();
  const [loading, setLoading] = React.useState(true);
  const [treeData, setTreeData] = React.useState<any>();
  const [checkedIds, setCheckedIds] = React.useState<string[]>(
    getInitialCheckIds(props.selectedRow.monitoringPoints)
  );

  function getInitialCheckIds(monitoringPoints?: MonitoringPointRow[]) {
    if (monitoringPoints === undefined) return [];
    return monitoringPoints.map((point) => `${point.id}-${point.type}`);
  }

  React.useEffect(() => {
    getAssets({ type: ROOT_ASSETS.get(category) })
      .then((assets) => {
        getTreedata(
          filterEmptyChildren(assets).filter((asset) => asset.parentId === 0),
          props.selectedRow.type
        );
      })
      .finally(() => setLoading(false));
  }, [props.selectedRow.type, category]);

  const renderModalContent = () => {
    if (loading) return <Spin />;
    if (!treeData || treeData.length === 0)
      return <Empty description='暂无数据' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    return (
      <Tree
        checkable={true}
        checkedKeys={checkedIds}
        onCheck={(keys: any) => setCheckedIds(keys)}
        treeData={treeData}
        fieldNames={{ key: 'key', title: 'name' }}
        defaultExpandAll={true}
        height={780}
      />
    );
  };

  function getTreedata(assets: AssetRow[], ruleTypeId: number) {
    const processNodeFn = (node: any) => {
      const points = node.monitoringPoints
        ? node.monitoringPoints.filter((point: any) => point.type === ruleTypeId)
        : node.monitoringPoints;
      if (node.children && node.children.length > 0 && points && points.length > 0) {
        return {
          ...node,
          children: [
            ...node.children,
            ...node.monitoringPoints.filter((point: any) => point.type === ruleTypeId)
          ]
        };
      } else if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: sortFlangesByAttributes(node.children as AssetRow[]),
          disableCheckbox: node.children.every((point: any) => point.type !== ruleTypeId)
        };
      } else if (points && points.length > 0) {
        return {
          ...node,
          children: sortMonitoringPointByAttributes(points),
          monitoringPoints: [],
          disableCheckbox: points.every((point: any) => point.type !== ruleTypeId)
        };
      } else {
        const disableCheckbox = node.type !== ruleTypeId;
        return { ...node, disableCheckbox };
      }
    };
    if (assets.length > 0) {
      const copy = cloneDeep(assets);
      const treedata = copy
        .map((node: any) => mapTreeNode(node, processNodeFn))
        .map((node) =>
          mapTreeNode(node, (node) => ({
            ...node,
            key: `${node.id}-${node.type}`
          }))
        );
      setTreeData(treedata);
    }
  }

  return (
    <Modal
      width={800}
      title={UPDATE_MONITORING_POINT}
      bodyStyle={{ maxHeight: 700, overflow: 'auto' }}
      {...props}
      onOk={() => {
        console.log(checkedIds);
        if (checkedIds.length === 0) props.onSuccess();
        if (checkedIds) {
          bindMeasurementsToAlarmRule2(props.selectedRow.id, {
            monitoring_point_ids: checkedIds
              .filter((key: string) => Number(key.substring(key.indexOf('-') + 1)) > 10000)
              .map((key: string) => Number(key.substring(0, key.indexOf('-'))))
          }).then(() => props.onSuccess());
        }
      }}
    >
      {renderModalContent()}
    </Modal>
  );
};
