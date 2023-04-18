import { Header } from 'antd/es/layout/layout';
import { Button, Col, Divider, Drawer, Dropdown, Row, Space, Typography } from 'antd';
import './layout.css';
import '../../assets/iconfont.css';
import logo from '../../assets/images/logo-dark.png';
import { CaretDownOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { persistor, store } from '../../store';
import { useState } from 'react';
import dayjs from '../../utils/dayjsUtils';
import ProjectSelect from '../../components/select/projectSelect';
import { NavMenu } from './NavMenu';
import { GetMyProjectRequest } from '../../apis/project';
import { Brand } from './brand';
import intl from 'react-intl-universal';
import { Language, useLocaleContext } from '../../localeProvider';

const { Text } = Typography;

const HeaderLayout = (props: any) => {
  const { setLocale, language } = useLocaleContext();
  const { menus } = props;
  const [currentUser] = useState<any>(store.getState().auth.data.user);
  const [now, setNow] = useState<string>(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const [open, setVisible] = useState(false);

  setInterval(() => {
    setNow(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  }, 1000);

  const onLogout = () => {
    persistor.purge().then((_) => {
      window.location.reload();
      localStorage.clear();
    });
  };

  const onProjectChange = (value: any) => {
    GetMyProjectRequest(value)
      .then((data) => {
        localStorage.removeItem('store');
        store.dispatch({
          type: 'SET_PROJECT',
          payload: data.id
        });
        window.location.href = '/';
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <Header className='ts-header'>
      <Row justify='start' className='pc'>
        <Col span={12}>
          <Brand
            height={36}
            brandNameStyle={{
              fontSize: 18,
              letterSpacing: 2
            }}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Space>
            <Text style={{ color: 'white', fontFamily: 'monospace' }} strong>
              {now}
            </Text>
            {currentUser && (
              <ProjectSelect
                bordered={false}
                suffixIcon={<CaretDownOutlined style={{ color: 'white' }} />}
                onChange={onProjectChange}
              />
            )}
            <Dropdown
              menu={{ items: [{ key: 'logout', label: intl.get('LOGOUT'), onClick: onLogout }] }}
            >
              <Space>
                <Button type={'text'} style={{ color: '#fff', paddingLeft: 0, paddingRight: 0 }}>
                  <UserOutlined />
                  {currentUser?.username}
                </Button>
              </Space>
            </Dropdown>
            <Dropdown
              menu={{
                items: [
                  { key: 'zh-CN', label: '中文' },
                  { key: 'en-US', label: 'EN' }
                ],
                onClick: ({ key }) => {
                  if (key !== language) {
                    setLocale((prev) => ({
                      ...prev,
                      language: key as Language
                    }));
                  }
                }
              }}
            >
              <Button
                type={'text'}
                style={{ color: '#fff', width: 60, paddingLeft: 0, paddingRight: 0 }}
              >
                {language === 'en-US' ? 'EN' : '中文'}
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>
      <div className='mobile'>
        <MenuOutlined onClick={() => setVisible(true)} />
        <div className='logo'>
          <img src={logo} width={100} alt='ThetaSensors' style={{ verticalAlign: 'middle' }} />
        </div>
        <Dropdown
          menu={{ items: [{ key: 'logout', label: intl.get('LOGOUT'), onClick: onLogout }] }}
        >
          <UserOutlined />
        </Dropdown>
        <Drawer
          open={open}
          placement='left'
          width='60%'
          closable={false}
          onClose={() => setVisible(false)}
          bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <NavMenu menus={menus} />
          <Divider />
          {currentUser && (
            <div style={{ paddingLeft: 24, paddingBottom: 100 }}>
              <ProjectSelect
                suffixIcon={<CaretDownOutlined />}
                style={{ width: '120px', textAlign: 'center' }}
                onChange={onProjectChange}
              />
            </div>
          )}
        </Drawer>
      </div>
    </Header>
  );
};

export default HeaderLayout;
