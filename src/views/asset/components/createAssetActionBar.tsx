import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import usePermission, { Permission } from '../../../permission/permission';
import { getProject } from '../../../utils/session';
import { MONITORING_POINT } from '../../monitoring-point';
import { ActionBar } from '../common/actionBar';
import { getParents } from '../common/utils';
import { importAssets } from '../services';
import {
  AssertAssetCategory,
  AssertOfAssetCategory,
  AssetCategoryChain,
  AssetCategoryKey,
  AssetRow
} from '../types';
import { AssetExport } from './assetExport';
import { FileInput } from './fileInput';

export function CreateAssetActionBar({
  roots,
  refresh,
  actionStatus,
  hiddens = [],
  needExtra = true,
  lastParent,
  pointParnet
}: {
  roots: AssetRow[];
  refresh: () => void;
  actionStatus: any;
  hiddens?: AssetCategoryKey[];
  needExtra?: boolean;
  lastParent?: AssetRow;
  pointParnet?: AssetRow;
}) {
  const { hasPermission } = usePermission();
  const { last, root, isChild } = useAssetCategoryChain();
  const parents = getParents(roots, last);
  const actions: React.ReactNode[] = [];

  const shouldHide = (key: AssetCategoryKey) => hiddens.includes(key);

  const handleUpload = (data: any) => {
    return importAssets(getProject(), data).then((res) => {
      if (res.data.code === 200) {
        message.success(intl.get('IMPORTED_SUCCESSFUL'));
        refresh();
      } else {
        message.error(`${intl.get('FAILED_TO_IMPORT')}: ${res.data.msg}`);
      }
    });
  };

  if (!shouldHide(root.key)) {
    actions.push(
      <Button
        key={root.key}
        type='primary'
        onClick={() => {
          actionStatus.onAssetCreate();
        }}
      >
        {intl.get('CREATE_SOMETHING', { something: intl.get(root.label) })}
        <PlusOutlined />
      </Button>
    );
  }
  const groupdChains: AssetCategoryChain[] = [];
  last.forEach(({ group }) => {
    if (group && !groupdChains.map((c) => c.key).includes(group.key)) {
      groupdChains.push({ key: group.key, label: group.label });
    }
  });
  groupdChains.forEach(({ key, label }) => {
    if (!isChild(key) && !shouldHide(key)) {
      actions.push(
        <Button
          key={key}
          type='primary'
          onClick={() => {
            if (AssertAssetCategory(key, AssertOfAssetCategory.IS_FLANGE)) {
              actionStatus.onFlangeCreate(lastParent?.id);
            } else if (AssertAssetCategory(key, AssertOfAssetCategory.IS_AREA_ASSET)) {
              actionStatus.onAreaAssetCreate();
            }
          }}
        >
          {intl.get('CREATE_SOMETHING', { something: intl.get(label) })}
          <PlusOutlined />
        </Button>
      );
    }
  });
  if (parents.length > 0) {
    actions.push(
      <Button
        key='create-monitoring-point'
        type='primary'
        onClick={() => actionStatus.onMonitoringPointCreate(pointParnet)}
      >
        {intl.get('CREATE_SOMETHING', { something: intl.get(MONITORING_POINT) })}
        <PlusOutlined />
      </Button>
    );
  }
  if (needExtra) {
    if (roots.length > 0) {
      actions.push(<AssetExport winds={roots} key='export' />);
    }
    actions.push(<FileInput onUpload={handleUpload} key='upload' />);
  }

  return (
    <ActionBar
      {...actionStatus}
      hasPermission={hasPermission(Permission.AssetAdd)}
      actions={actions}
      onSuccess={() => refresh()}
    />
  );
}
