import { Col, Form, Input, message, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import EditPassModal from './edit/editPassModal';
import './index.css';
import { GetMyProfile, UpdateMyProfile } from '../../apis/profile';
import { User } from '../../types/user';
import ShadowCard from '../../components/shadowCard';
import { isMobile } from '../../utils/deviceDetection';
import { PageTitle } from '../../components/pageTitle';
import intl from 'react-intl-universal';

const MePage = () => {
  const [isPhoneEdit, setIsPhoneEdit] = useState<boolean>(false);
  const [isEmailEdit, setIsEmailEdit] = useState<boolean>(false);
  const [isPassEdit, setIsPassEdit] = useState<boolean>(false);
  const [user, setUser] = useState<User>();
  const [form] = Form.useForm();

  useEffect(() => {
    GetMyProfile().then(setUser);
  }, []);

  const renderPhone = () => {
    if (isPhoneEdit) {
      return (
        <Form.Item name={'phone'} initialValue={user?.phone}>
          <Input size='small' />
        </Form.Item>
      );
    } else {
      return user && user.phone.length ? user.phone : intl.get('NOT_BOUND_PROMPT');
    }
  };

  const onSavePhone = () => {
    form.validateFields(['phone']).then((values) => {
      UpdateMyProfile({ phone: values.phone }).then((res) => {
        if (res.code === 200) {
          message.success(intl.get('SAVED_SUCCESSFUL')).then();
          setUser(res.data);
        } else {
          message.error(intl.get('FAILED_TO_SAVE')).then();
        }
        setIsPhoneEdit(false);
      });
    });
  };

  const renderEmail = () => {
    if (isEmailEdit) {
      return (
        <Form.Item name={'email'} initialValue={user?.email} rules={[{ type: 'email' }]}>
          <Input size='small' />
        </Form.Item>
      );
    } else {
      return user && user.email.length ? user.email : intl.get('NOT_BOUND_PROMPT');
    }
  };

  const onSaveEmail = () => {
    form.validateFields(['email']).then((values) => {
      UpdateMyProfile({ email: values.email }).then((res) => {
        if (res.code === 200) {
          message.success(intl.get('SAVED_SUCCESSFUL')).then();
          setUser(res.data);
        } else {
          message.error(intl.get('FAILED_TO_SAVE')).then();
        }
        setIsEmailEdit(false);
      });
    });
  };

  return (
    <Content>
      <PageTitle items={[{ title: intl.get('MENU_USER_CENTER') }]} />
      <Row justify='center'>
        <Col span={24}>
          <ShadowCard title={intl.get('BASIC_INFORMATION')} bordered={false}>
            <Form form={form}>
              <p>
                <Row justify={'start'}>
                  <Col span={isMobile ? 5 : 2} className='ts-label'>
                    {intl.get('ACCOUNT_NAME')}
                  </Col>
                  <Col span={isMobile ? 15 : 5}>{user?.username}</Col>
                  {!isMobile && <Col span={2}></Col>}
                </Row>
              </p>
              <p>
                <Row justify={'start'}>
                  <Col span={isMobile ? 5 : 2} className='ts-label'>
                    {intl.get('CELLPHONE')}
                  </Col>
                  <Col span={isMobile ? 15 : 5}>{renderPhone()}</Col>
                  <Col span={isMobile ? 3 : 2} offset={1}>
                    {isPhoneEdit ? (
                      <a onClick={onSavePhone}>{intl.get('SAVE')}</a>
                    ) : (
                      <a onClick={() => setIsPhoneEdit(true)}>{intl.get('MODIFY')}</a>
                    )}
                  </Col>
                </Row>
              </p>
              <p>
                <Row justify={'start'}>
                  <Col span={isMobile ? 5 : 2} className='ts-label'>
                    {intl.get('EMAIL')}
                  </Col>
                  <Col span={isMobile ? 15 : 5}>{renderEmail()}</Col>
                  <Col span={isMobile ? 3 : 2} offset={1}>
                    {isEmailEdit ? (
                      <a onClick={onSaveEmail}>{intl.get('SAVE')}</a>
                    ) : (
                      <a onClick={() => setIsEmailEdit(true)}>{intl.get('MODIFY')}</a>
                    )}
                  </Col>
                </Row>
              </p>
            </Form>
          </ShadowCard>
          <br />
          <ShadowCard title={intl.get('ACCOUNT_SAFETY')} bordered={false}>
            <Row justify={'start'}>
              <Col span={isMobile ? 5 : 2} className='ts-label'>
                {intl.get('PASSWORD')}
              </Col>
              <Col span={isMobile ? 15 : 5}>****************</Col>
              <Col span={isMobile ? 3 : 2} offset={1}>
                <a onClick={() => setIsPassEdit(true)}>{intl.get('MODIFY')}</a>
              </Col>
            </Row>
          </ShadowCard>
        </Col>
      </Row>
      <EditPassModal
        visible={isPassEdit}
        onSuccess={() => {
          setIsPassEdit(false);
        }}
        onCancel={() => {
          setIsPassEdit(false);
        }}
      />
    </Content>
  );
};

export default MePage;
