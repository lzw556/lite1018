import { Empty, Modal, ModalProps, Spin, Tree } from 'antd';
import * as React from 'react';
import { getAssets } from '../../asset/services';
import { AssetRow, AssetTreeNode } from '../../asset/types';
import { MonitoringPointRow, MONITORING_POINT } from '../../monitoring-point';
import { bindMeasurementsToAlarmRule2 } from './services';
import { AlarmRule } from './types';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import { combineMonitoringPointToAsset } from '../../asset/common/utils';
import { list2Tree, mapTree, tree2List } from '../../../utils/tree';

export const BindMonitoringPoints2: React.FC<
  ModalProps & { selectedRow: AlarmRule } & { onSuccess: () => void }
> = (props) => {
  const { root } = useAssetCategoryChain();
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
    getAssets({ type: root.key, parent_id: 0 })
      .then((assets) => {
        getTreedata(assets, props.selectedRow.type);
      })
      .finally(() => setLoading(false));
  }, [props.selectedRow.type, root.key]);

  const renderModalContent = () => {
    if (loading) return <Spin />;
    if (!treeData || treeData.length === 0)
      return (
        <Empty description={intl.get('NO_DATA_PROMPT')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
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
    if (assets.length > 0) {
      const mixedTree = mapTree(assets, (asset) => combineMonitoringPointToAsset(asset));
      const list = tree2List(mixedTree);
      const matchedList = list.filter((item) => item.type > 10000 && item.type === ruleTypeId);
      const mathcedAssetIds: (string | number)[] = [];
      matchedList.forEach(({ path }) => {
        if (path) {
          path.forEach((item, index) => {
            if (index < path.length - 1) {
              mathcedAssetIds.push(item);
            }
          });
        }
      });
      const matchedAssetList = list.filter(
        (item) => item.type < 10000 && Array.from(new Set(mathcedAssetIds)).includes(item.id)
      );
      const tree: AssetTreeNode[] = list2Tree([...matchedAssetList, ...matchedList]);
      const treedata = mapTree(tree, (node) => ({
        ...node,
        key: node.type < 10000 ? `${node.id}-${node.type}` : `${node.id}`
      }));
      setTreeData(treedata);
    }
  }

  return (
    <Modal
      width={800}
      title={intl.get('EDIT_SOMETHING', { something: intl.get(MONITORING_POINT) })}
      // bodyStyle={{ maxHeight: 700, overflow: 'auto' }}
      {...props}
      onOk={() => {
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
