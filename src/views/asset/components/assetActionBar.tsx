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
import { useAppConfigContext } from './appConfigContext';

export function AssetActionBar({
  roots,
  refresh,
  actionStatus
}: {
  roots: AssetRow[];
  refresh: () => void;
  actionStatus: any;
}) {
  const config = useAppConfigContext();
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
      size='small'
      title={intl.get('CREATE_SOMETHING', { something: intl.get(root.label) })}
      onClick={() => {
        if (config.type === 'vibration') {
          actionStatus.onVibrationAssetCreate();
        } else {
          actionStatus.onAssetCreate();
        }
      }}
    >
      <PlusOutlined />
    </Button>
  );

  if (roots.length > 0) {
    actions.push(
      <AllMonitoringPointsDownload
        winds={roots}
        key='downloadAll'
        onlyIcon
        buttonProps={{ size: 'small' }}
      />
    );
    actions.push(
      <AssetExport winds={roots} key='export' onlyIcon buttonProps={{ size: 'small' }} />
    );
  }
  actions.push(
    <FileInput onUpload={handleUpload} key='upload' onlyIcon buttonProps={{ size: 'small' }} />
  );

  return (
    <ActionBar
      {...actionStatus}
      hasPermission={hasPermission(Permission.AssetAdd)}
      actions={actions}
      onSuccess={() => refresh()}
    />
  );
}
