import { Button, Result, Space } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';

const UnauthorizedPage = () => {
  return (
    <Result
      status='403'
      title='403'
      subTitle={intl.get('NO_PERMISSION_PROMPT')}
      extra={
        <Space>
          <Button
            type='default'
            onClick={() => {
              window.location.hash = '/';
            }}
          >
            {intl.get('RETURN_TO_HOME')}
          </Button>
          <Button
            type='primary'
            onClick={() => {
              window.location.hash = '/login';
            }}
          >
            {intl.get('LOGIN_AGAIN')}
          </Button>
        </Space>
      }
    />
  );
};

export default UnauthorizedPage;
