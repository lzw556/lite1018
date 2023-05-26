import { Content } from 'antd/es/layout/layout';
import ShadowCard from '../../../components/shadowCard';
import { Button, Col, Form, Input, message, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Network } from '../../../types/network';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ExportNetworkRequest,
  GetNetworkRequest,
  UpdateNetworkRequest
} from '../../../apis/network';
import { TopologyView } from './topology';
import usePermission, { Permission } from '../../../permission/permission';
import ButtonGroup from 'antd/lib/button/button-group';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { WIRELESS_HART_POLLING_PERIOD } from '../../../constants';
import { SelfLink } from '../../../components/selfLink';

export default function ShowNetwork() {
  const { hasPermission } = usePermission();
  const { id } = useParams();
  const navigate = useNavigate();
  const [network, setNetwork] = useState<Network>();
  const [form] = Form.useForm();

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
        name: network.name,
        gateway: {
          ip_address: network.gateway.ipAddress,
          ip_port: network.gateway.ipPort,
          polling_period: network.gateway.pollingPeriod
        }
      });
    }
  }, [network, form]);

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
                <FormInputItem
                  label={intl.get('IP_ADDRESS')}
                  name={['gateway', 'ip_address']}
                  requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('IP_ADDRESS')
                  })}
                  lengthLimit={{ min: 4, max: 16, label: intl.get('NETWORK').toLowerCase() }}
                >
                  <Input
                    placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                      something: intl.get('IP_ADDRESS')
                    })}
                  />
                </FormInputItem>
                <FormInputItem
                  label={intl.get('PORT')}
                  name={['gateway', 'ip_port']}
                  requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('PORT')
                  })}
                  numericRule={{
                    isInteger: true,
                    min: 1,
                    message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
                  }}
                  placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                    something: intl.get('PORT')
                  })}
                />
                <Form.Item label={intl.get('POLLING_PERIOD')} name={['gateway', 'polling_period']}>
                  <Select>
                    {WIRELESS_HART_POLLING_PERIOD.map(({ value, text }) => (
                      <Select.Option value={value} key={value}>
                        {intl.get(text)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                  <Row justify='end'>
                    <Col>
                      <ButtonGroup>
                        {hasPermission(Permission.NetworkExport) && (
                          <Button type='primary' onClick={() => exportNetwork(network)}>
                            {intl.get('EXPORT_NETWORK')}
                          </Button>
                        )}
                        {hasPermission(Permission.NetworkEdit) && (
                          <Button
                            type='primary'
                            onClick={() => {
                              form.validateFields().then((values) => {
                                UpdateNetworkRequest(network.id, {
                                  ...values,
                                  gateway: {
                                    ...values.gateway,
                                    ip_port: Number(values.gateway.ip_port)
                                  }
                                }).then((res) => {
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
          { title: <SelfLink to='/networks'>{intl.get('MENU_NETWORK_LIST')}</SelfLink> },
          { title: intl.get('NETWORK_DETAIL') }
        ]}
      />
      {renderInformation()}
    </Content>
  );
}
