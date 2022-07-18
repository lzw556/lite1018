import { ExportOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { getProject } from '../../../utils/session';
import { exportAssets } from '../assetList/services';
import { getFilename } from '../common/utils';

export const AssetExport = () => {
  return (
    <Button
      type='primary'
      onClick={() => {
        exportAssets(getProject()).then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', getFilename(res));
          document.body.appendChild(link);
          link.click();
        });
      }}
    >
      导出配置
      <ExportOutlined />
    </Button>
  );
};
