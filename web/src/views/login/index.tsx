import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { LoginRequest } from '../../apis/user';
import ad from '../../assets/images/login-ad-dark.png';
import '../../App.css';
import './login.css';
import { userLoginSuccess } from '../../store/actions/userLoginSuccess';
import { useDispatch } from 'redux-react-hook';
import { persistor } from '../../store';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Brand } from '../layout/brand';

const LoginPage: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const login = (values: any) => {
    setIsLoading(true);
    LoginRequest(values.username, values.password).then((res) => {
      setIsLoading(false);
      if (res.code === 200) {
        message.success('登录成功').then();
        dispatch(userLoginSuccess(res.data));
        window.location.hash = '/';
      } else {
        message.error(res.msg).then();
      }
    });
  };

  useEffect(() => {
    persistor.purge().then();
  });

  return (
    <div id='login-page'>
      <div className={'logo'}>
        <Row justify='center' align='bottom'>
          <Col span={24}>
            <Brand
              height={80}
              gap={48}
              brandNameStyle={{ fontSize: 42, color: '#fff', letterSpacing: '10pt' }}
            />
          </Col>
        </Row>
        <br />
        <Row justify='center' align='bottom' style={{ visibility: 'hidden' }}>
          <Col span={24}>
            <img src={ad} alt='Theta' />
          </Col>
        </Row>
        <br />
        <Row justify='center' align='bottom'>
          <Col span={24} className='split-line' />
        </Row>
      </div>
      <div className={'ts-login-form'}>
        <Form onFinish={login}>
          <Form.Item name='username' rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder='用户名' />
          </Form.Item>
          <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
            <Input prefix={<KeyOutlined />} placeholder='密码' type='password' />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
