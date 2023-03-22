import { ExportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { AssetRow } from '..';
import { SelectAssets } from './selectAssets';
import intl from 'react-intl-universal';

export const AssetExport: React.FC<{ winds: AssetRow[] }> = ({ winds }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <>
      <Button
        type='primary'
        onClick={() => {
          setVisible(true);
        }}
      >
        {intl.get('EXPORT_SETTINGS')}
        <ExportOutlined />
      </Button>
      {visible && (
        <SelectAssets
          open={visible}
          onCancel={() => setVisible(false)}
          winds={winds}
          onSuccess={() => setVisible(false)}
        />
      )}
    </>
  );
};
