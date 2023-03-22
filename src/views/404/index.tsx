import { FC } from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';

const NotFoundPage: FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status='404'
      title='404'
      subTitle={intl.get('INVALID_PAGE_PROMPT')}
      extra={
        <Button
          type='primary'
          onClick={() => {
            navigate('/');
          }}
        >
          {intl.get('RETURN_TO_HOME')}
        </Button>
      }
    />
  );
};

export default NotFoundPage;
