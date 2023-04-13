import { Content } from 'antd/es/layout/layout';
import ShadowCard from '../../../components/shadowCard';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Network } from '../../../types/network';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ExportNetworkRequest,
  GetNetworkRequest,
  NetworkProvisionRequest,
  NetworkSyncRequest,
  UpdateNetworkRequest
} from '../../../apis/network';
import TopologyView from './topologyView';
import usePermission, { Permission } from '../../../permission/permission';
import ButtonGroup from 'antd/lib/button/button-group';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { useProvisionMode } from '../useProvisionMode';
import { PageTitle } from '../../../components/pageTitle';
import { Link } from 'react-router-dom';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

const NetworkDetail = () => {
  const { hasPermission } = usePermission();
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
            message.success(intl.get('SENT_SUCCESSFUL'));
          } else {
            message.error(`${intl.get('FAILED_TO_SEND')}${intl.get(res.msg).d(res.msg)}`);
          }
        });
        break;
      case '1':
        NetworkProvisionRequest(network.id).then((res) => {
          if (res.code === 200) {
            message.success(intl.get('SENT_SUCCESSFUL'));
          } else {
            message.error(`${intl.get('FAILED_TO_SEND')}${intl.get(res.msg).d(res.msg)}`);
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
              <Form form={form} labelCol={{ span: 9 }}>
                <FormInputItem
                  label={intl.get('NAME')}
                  name='name'
                  requiredMessage={intl.get('PLEASE_ENTER_NAME')}
                  lengthLimit={{ min: 4, max: 16, label: intl.get('NAME').toLowerCase() }}
                >
                  <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
                </FormInputItem>
                {provisionMode && (
                  <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />
                )}
                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                  <Row justify='end'>
                    <Col>
                      <ButtonGroup>
                        {hasPermission(Permission.NetworkExport) && (
                          <Button type='primary' onClick={() => sendCommand(network, '2')}>
                            {intl.get('EXPORT_NETWORK')}
                          </Button>
                        )}
                        {hasPermission(Permission.NetworkEdit) && (
                          <Button
                            type='primary'
                            onClick={() => {
                              form.validateFields().then((values) => {
                                UpdateNetworkRequest(network.id, values).then((res) => {
                                  if (res.code === 200)
                                    message.success(intl.get('SAVED_SUCCESSFUL'));
                                });
                              });
                            }}
                          >
                            {intl.get('SAVE_NETWORK')}
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
                        {intl.get('SYNC_NETWORK')}
                      </Button>
                    )}
                    {hasPermission(Permission.NetworkProvision) && (
                      <Button type='primary' onClick={() => sendCommand(network, '1')}>
                        {intl.get('PROVISION')}
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
      <PageTitle
        items={[
          { title: <Link to='/networks'>{intl.get('MENU_NETWORK_LIST')}</Link> },
          { title: intl.get('NETWORK_DETAIL') }
        ]}
      />
      {renderInformation()}
    </Content>
  );
};

export default NetworkDetail;
