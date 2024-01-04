import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { AssetRow } from '..';
import intl from 'react-intl-universal';
import { BatchDownlaodHistoryDataModal } from './batchDownlaodHistoryDataModal';

export const AllMonitoringPointsDownload: React.FC<{ winds: AssetRow[]; disabled?: boolean }> = ({
  winds,
  disabled
}) => {
  const [open, setVisible] = React.useState(false);
  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          setVisible(true);
        }}
        type='primary'
      >
        {intl.get('BATCH_DOWNLOAD')}
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
