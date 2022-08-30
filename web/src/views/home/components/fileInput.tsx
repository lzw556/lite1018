import { ImportOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import * as React from 'react';

export const FileInput: React.FC<{
  onUpload: (data: any) => Promise<void>;
}> = ({ onUpload }) => {
  const [loading, setLoading] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement | null>(null);
  return (
    <div className='file-input' style={{ position: 'relative' }}>
      <input
        type='file'
        ref={fileInput}
        style={{
          opacity: 0,
          position: 'absolute',
          zIndex: 10,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }}
        title='导入配置'
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onprogress = () => {
              setLoading(true);
            };
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result as string);
                onUpload(data).finally(() => setLoading(false));
              } catch (error) {
                setLoading(false);
                message.error('文件内部格式不正确');
              } finally {
                if (fileInput && fileInput.current) fileInput.current.value = '';
              }
            };
          }
        }}
      />
      <Button
        type='primary'
        className={`ant-btn ant-btn-primary ${loading ? 'ant-btn-loading' : ''}`}
      >
        <span className='ant-btn-loading-icon'> {loading && <LoadingOutlined />}</span>
        {loading ? '导入中...' : '导入配置'}
        <ImportOutlined />
      </Button>
    </div>
  );
};
