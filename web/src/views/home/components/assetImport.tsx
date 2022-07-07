import { ImportOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import * as React from 'react';
import { getProject } from '../../../utils/session';
import { importAssets } from '../assetList/services';

export const AssetImport: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = React.useState(false);
  return (
    <Upload
      {...{
        showUploadList: false,
        children: (
          <Button type='primary' loading={loading}>
            导入配置
            <ImportOutlined />
          </Button>
        ),
        beforeUpload: (file) => {
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result as string);
              setLoading(true);
              importAssets(getProject(), data).then((res) => {
                setLoading(false);
                return new Promise<any>((resolve, reject) => {
                  if (res.data.code === 200) {
                    message.success('导入成功');
                    onSuccess();
                    resolve(1);
                  } else {
                    message.error(`导入失败: ${res.data.msg}`);
                    reject(res.data.msg);
                  }
                });
              });
            } catch (error) {
              message.error('文件内部格式不正确');
            } finally {
              setLoading(false);
              return false;
            }
          };
        }
      }}
    >
      <Button type='primary' loading={loading}>
        导入配置
        <ImportOutlined />
      </Button>
    </Upload>
  );
};
