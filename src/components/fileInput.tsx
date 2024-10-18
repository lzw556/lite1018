import * as React from 'react';
import { Button, ButtonProps, message } from 'antd';
import { ImportOutlined, LoadingOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';

export const FileInput: React.FC<{
  onUpload: (data: any) => Promise<void>;
  buttonProps?: ButtonProps;
}> = ({ buttonProps, onUpload }) => {
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
        title={intl.get('IMPORT_SETTINGS')}
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
                message.error(intl.get('FILE_IS_INVALID'));
              } finally {
                if (fileInput && fileInput.current) fileInput.current.value = '';
              }
            };
          }
        }}
      />
      <Button
        {...buttonProps}
        type='primary'
        className={`ant-btn ant-btn-primary ${loading ? 'ant-btn-loading' : ''}`}
      >
        {loading && (
          <span className='ant-btn-loading-icon'>
            <LoadingOutlined />
          </span>
        )}
        <>{loading ? intl.get('IMPORTING_PROMPT') : intl.get('IMPORT_SETTINGS')}</>
        <ImportOutlined />
      </Button>
    </div>
  );
};
