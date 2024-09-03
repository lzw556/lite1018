import { DownloadOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import * as React from 'react';
import { AssetRow } from '..';
import intl from 'react-intl-universal';
import { BatchDownlaodHistoryDataModal } from './batchDownlaodHistoryDataModal';

export const AllMonitoringPointsDownload: React.FC<{
  winds: AssetRow[];
  disabled?: boolean;
  onlyIcon?: boolean;
  buttonProps?: ButtonProps;
}> = ({ buttonProps, winds, disabled, onlyIcon = false }) => {
  const [open, setVisible] = React.useState(false);
  return (
    <>
      <Button
        {...buttonProps}
        disabled={disabled}
        onClick={() => {
          setVisible(true);
        }}
        type='primary'
        title={intl.get('BATCH_DOWNLOAD')}
      >
        {!onlyIcon && intl.get('BATCH_DOWNLOAD')}
        <DownloadOutlined />
      </Button>
      {open && (
        <BatchDownlaodHistoryDataModal
          open={open}
          onCancel={() => setVisible(false)}
          assets={winds}
          // onSuccess={() => setVisible(false)}
        />
      )}
    </>
  );
};
