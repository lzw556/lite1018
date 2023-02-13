import { ExportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import { AssetRow } from '../assetList/props';
import { WindSelection } from './windSelection';

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
        导出配置
        <ExportOutlined />
      </Button>
      {visible && (
        <WindSelection
          visible={visible}
          onCancel={() => setVisible(false)}
          winds={winds}
          onSuccess={() => setVisible(false)}
        />
      )}
    </>
  );
};
