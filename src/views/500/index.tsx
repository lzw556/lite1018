import { FC } from 'react';
import { Button, Result } from 'antd';
import intl from 'react-intl-universal';

const ServerErrorPage: FC = () => {
  return (
    <Result
      status='500'
      title='500'
      subTitle={intl.get('SERVER_ERROR_PRPMPT')}
      extra={
        <Button
          type='primary'
          onClick={() => {
            window.location.hash = '/';
          }}
        >
          {intl.get('RETURN_TO_HOME')}
        </Button>
      }
    />
  );
};

export default ServerErrorPage;
