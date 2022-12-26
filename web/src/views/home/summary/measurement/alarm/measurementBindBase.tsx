import { Empty, Modal, ModalProps, Spin, Tree } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import * as AppConfig from '../../../../../config';
import { AssetRow } from '../../../assetList/props';
import { getAssets } from '../../../assetList/services';
import { sortFlangesByAttributes } from '../../../assetList/util';
import { filterEmptyChildren, mapTreeNode } from '../../../common/treeDataHelper';
import { sortMeasurementsByAttributes } from '../../../measurementList/util';
import { AlarmRule, MeasurementRow } from '../props';
import { bindMeasurementsToAlarmRule2 } from '../services';

export const MeasurementBindBase: React.FC<
  ModalProps & { selectedRow: AlarmRule } & { onSuccess: () => void }
> = (props) => {
  console.log(getInitialCheckIds(props.selectedRow.monitoringPoints));
  const [loading, setLoading] = React.useState(true);
  const [treeData, setTreeData] = React.useState<any>();
  const [checkedIds, setCheckedIds] = React.useState<string[]>(
    getInitialCheckIds(props.selectedRow.monitoringPoints)
  );

  function getInitialCheckIds(monitoringPoints?: MeasurementRow[]) {
    if (monitoringPoints === undefined) return [];
    return monitoringPoints.map((point) => `${point.id}-${point.type}`);
  }

  React.useEffect(() => {
    getAssets({ type: AppConfig.use(window.assetCategory).assetType.id })
      .then((assets) => {
        getTreedata(
          filterEmptyChildren(assets).filter((asset) => asset.parentId === 0),
          props.selectedRow.type
        );
      })
      .finally(() => setLoading(false));
  }, [props.selectedRow.type]);

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
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: sortFlangesByAttributes(node.children as AssetRow[]),
          disableCheckbox: node.children.every((point: any) => point.type !== ruleTypeId)
        };
      } else if (node.monitoringPoints && node.monitoringPoints.length > 0) {
        return {
          ...node,
          children: sortMeasurementsByAttributes(node.monitoringPoints),
          monitoringPoints: [],
          disableCheckbox: node.monitoringPoints.every((point: any) => point.type !== ruleTypeId)
        };
      } else {
        const disableCheckbox = node.type !== ruleTypeId;
        return { ...node, disableCheckbox };
      }
    };
    if (assets.length > 0) {
      const copy = cloneDeep(assets);
      const treedata = copy
        .map((node) =>
          mapTreeNode(node, (node) => {
            if (node.children && node.monitoringPoints) {
              return { ...node, children: [...node.children, ...node.monitoringPoints] };
            } else {
              return node;
            }
          })
        )
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
      title='编辑监测点'
      bodyStyle={{ maxHeight: 700, overflow: 'auto' }}
      {...props}
      // okButtonProps={{ disabled: checkedIds.length === 0 }}
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
