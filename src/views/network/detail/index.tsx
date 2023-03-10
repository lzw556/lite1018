import { Content } from 'antd/es/layout/layout';
import ShadowCard from '../../../components/shadowCard';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Network } from '../../../types/network';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ExportNetworkRequest,
  GetNetworkRequest,
  NetworkProvisionRequest,
  NetworkSyncRequest,
  UpdateNetworkRequest
} from '../../../apis/network';
import '../../../string-extension';
import TopologyView from './topologyView';
import '../index.css';
import usePermission, { Permission } from '../../../permission/permission';
import ButtonGroup from 'antd/lib/button/button-group';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { useProvisionMode } from '../useProvisionMode';
import { PageTitle } from '../../../components/pageTitle';
import { Link } from 'react-router-dom';

const NetworkDetail = () => {
  const { hasPermission } = usePermission();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [network, setNetwork] = useState<Network>();
  const [form] = Form.useForm();
  const [provisionMode, setProvisionMode, settings] = useProvisionMode(network);

  useEffect(() => {
    if (id) {
      GetNetworkRequest(Number(id))
        .then((data) => {
          setNetwork(data);
        })
        .catch((_) => {
          navigate(-1);
        });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (network !== undefined) {
      form.setFieldsValue({
        name: network.name
      });
      setProvisionMode(network.mode === 0 ? 1 : network.mode);
    }
  }, [network, form, setProvisionMode]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [form, settings]);

  const sendCommand = (network: Network, key: string) => {
    switch (key) {
      case '0':
        NetworkSyncRequest(network.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '1':
        NetworkProvisionRequest(network.id).then((res) => {
          if (res.code === 200) {
            message.success('发送成功');
          } else {
            message.error(`发送失败: ${res.msg}`);
          }
        });
        break;
      case '2':
        exportNetwork(network);
        break;
    }
  };

  const exportNetwork = (n: Network) => {
    ExportNetworkRequest(n.id).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${n.name}.json`);
      document.body.appendChild(link);
      link.click();
    });
  };

  const renderInformation = () => {
    if (network) {
      return (
        <Row style={{ flexGrow: 1 }}>
          <Col xl={16} xxl={18} id={'topologyView'}>
            <ShadowCard
              style={{ height: '100%' }}
              bodyStyle={{ height: '100%', minWidth: '500px' }}
            >
              <TopologyView network={network} />
            </ShadowCard>
          </Col>
          <Col xl={8} xxl={6}>
            <ShadowCard style={{ marginLeft: 10, height: '100%' }}>
              <Form form={form} labelCol={{ span: 9 }} validateMessages={defaultValidateMessages}>
                <Form.Item label={'名称'} name={'name'} rules={[Rules.range(4, 16)]}>
                  <Input placeholder={'请输入网络名称'} />
                </Form.Item>
                {provisionMode && (
                  <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />
                )}
                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                  <Row justify='end'>
                    <Col>
                      <ButtonGroup>
                        {hasPermission(Permission.NetworkExport) && (
                          <Button type='primary' onClick={() => sendCommand(network, '2')}>
                            导出网络
                          </Button>
                        )}
                        {hasPermission(Permission.NetworkEdit) && (
                          <Button
                            type='primary'
                            onClick={() => {
                              form.validateFields().then((values) => {
                                UpdateNetworkRequest(network.id, values).then((res) => {
                                  if (res.code === 200) message.success('保存成功');
                                });
                              });
                            }}
                          >
                            保存网络
                          </Button>
                        )}
                      </ButtonGroup>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
              <Row justify='end'>
                <Col>
                  <ButtonGroup>
                    {hasPermission(Permission.NetworkSync) && (
                      <Button type='primary' onClick={() => sendCommand(network, '0')}>
                        同步网络
                      </Button>
                    )}
                    {hasPermission(Permission.NetworkProvision) && (
                      <Button type='primary' onClick={() => sendCommand(network, '1')}>
                        继续组网
                      </Button>
                    )}
                  </ButtonGroup>
                </Col>
              </Row>
            </ShadowCard>
          </Col>
        </Row>
      );
    }
  };

  return (
    <Content style={{ display: 'flex', flexDirection: 'column' }}>
      <PageTitle items={[{ title: <Link to='/networks'>网络列表</Link> }, { title: '网络详情' }]} />
      {renderInformation()}
    </Content>
  );
};

export default NetworkDetail;
