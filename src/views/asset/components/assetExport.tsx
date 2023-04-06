import { ExportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { AssetRow } from '..';
import { SelectAssets } from './selectAssets';
import intl from 'react-intl-universal';

export const AssetExport: React.FC<{ winds: AssetRow[]; disabled?: boolean }> = ({
  winds,
  disabled
}) => {
  const [open, setVisible] = React.useState(false);
  return (
    <>
      <Button
        type='primary'
        disabled={disabled}
        onClick={() => {
          setVisible(true);
        }}
      >
        {intl.get('EXPORT_SETTINGS')}
        <ExportOutlined />
      </Button>
      {open && (
        <SelectAssets
          open={open}
          onCancel={() => setVisible(false)}
          winds={winds}
          onSuccess={() => setVisible(false)}
        />
      )}
    </>
  );
};
