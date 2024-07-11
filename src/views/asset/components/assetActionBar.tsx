import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import intl from 'react-intl-universal';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';
import usePermission, { Permission } from '../../../permission/permission';
import { getProject } from '../../../utils/session';
import { ActionBar } from '../common/actionBar';
import { importAssets } from '../services';
import { AssetRow } from '../types';
import { AssetExport } from './assetExport';
import { FileInput } from './fileInput';
import { AllMonitoringPointsDownload } from './allMonitoringPointsDownload';

export function AssetActionBar({
  roots,
  refresh,
  actionStatus
}: {
  roots: AssetRow[];
  refresh: () => void;
  actionStatus: any;
}) {
  const { hasPermission } = usePermission();
  const { root } = useAssetCategoryChain();
  const actions: React.ReactNode[] = [];

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

  actions.push(
    <Button
      key={root.key}
      type='primary'
      onClick={() => {
        actionStatus.onAssetCreate();
      }}
    >
      <PlusOutlined />
    </Button>
  );

  if (roots.length > 0) {
    actions.push(<AllMonitoringPointsDownload winds={roots} key='downloadAll' onlyIcon />);
    actions.push(<AssetExport winds={roots} key='export' onlyIcon />);
  }
  actions.push(<FileInput onUpload={handleUpload} key='upload' onlyIcon />);

  return (
    <ActionBar
      {...actionStatus}
      hasPermission={hasPermission(Permission.AssetAdd)}
      actions={actions}
      onSuccess={() => refresh()}
    />
  );
}
