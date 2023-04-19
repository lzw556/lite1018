import { Button, Card, Col, Form, Input, message, Result, Row, Select, Upload } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { ImportOutlined, InboxOutlined } from '@ant-design/icons';
import { ImportNetworkRequest } from '../../../apis/network';
import ShadowCard from '../../../components/shadowCard';
import G6, { TreeGraph } from '@antv/g6';
import '../../../components/shape/shape';
import { useNavigate } from 'react-router';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { WIRELESS_HART_POLLING_PERIOD } from '../../../constants';

const { Dragger } = Upload;

export interface NetworkRequestForm {
  mode: number;
  wsn: any;
  devices: any;
}

const ImportNetworkPage = () => {
  const [height] = useState<number>(window.innerHeight - 190);
  const [network, setNetwork] = useState<any>();
  const [success, setSuccess] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [graph, setGraph] = useState<TreeGraph | undefined>();
  const navigate = useNavigate();

  const checkJSONFormat = (source: any) => {
    return source.hasOwnProperty('deviceList') && source.hasOwnProperty('wsn');
  };

  const onBeforeUpload = (file: any) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const json = JSON.parse(reader.result);
        if (checkJSONFormat(json)) {
          debugger;
          setNetwork({ wsn: json.wsn, devices: json.deviceList });
        } else {
          message.error(intl.get('INVALID_FILE_FORMAT')).then();
        }
      }
    };
    return false;
  };

  useEffect(() => {
    function handleResize() {
      if (graph) {
        graph.changeSize(
          document.querySelector('#container')?.clientWidth ?? 500,
          document.querySelector('#container')?.clientHeight ?? 500
        );
        graph.fitView();
      }
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [graph]);

  const onSave = () => {
    if (network === undefined) {
      message.error(intl.get('PLEASE_UPLOAD_FILE'));
      return;
    }
    const nodes = network.devices;
    if (nodes && nodes.length) {
      form.validateFields().then((values) => {
        // const req: NetworkRequestForm = {
        //   devices: nodes.map((n: any) => {
        //     return {
        //       name: n.name,
        //       mac_address: n.address,
        //       parent_address: n.parentAddress,
        //       type_id: n.type,
        //       settings: n.settings
        //     };
        //   })
        // };
        // ImportNetworkRequest(req).then((_) => setSuccess(true));
      });
    } else {
      message.error(intl.get('DO_NOT_IMPORT_EMPTY_NETWORK')).then();
    }
  };

  useEffect(() => {
    const tree: any = (root: any) => {
      return network.devices
        .slice(1)
        .filter((node: any) => node.parentAddress === root.address)
        .map((item: any) => {
          return {
            id: item.address,
            data: item,
            children: tree(item)
          };
        });
    };
    if (network?.devices && network?.devices.length) {
      if (!graph) {
        const graphInstance = new G6.TreeGraph({
          container: 'container',
          // width: document.querySelector('#container')?.clientWidth,
          // height: document.querySelector('#container')?.clientHeight,
          modes: {
            default: [{ type: 'collapse-expand' }, 'drag-canvas', 'zoom-canvas']
          },
          defaultNode: {
            type: 'gateway',
            size: [120, 40],
            anchorPoints: [
              [0, 0.5],
              [1, 0.5]
            ]
          },
          defaultEdge: {
            type: 'cubic-horizontal',
            style: {
              stroke: '#A3B1BF'
            }
          },
          layout: {
            type: 'compactBox',
            direction: 'LR',
            getId: function getId(d: any) {
              return d.id;
            },
            getHeight: function getHeight() {
              return 16;
            },
            getWidth: function getWidth() {
              return 16;
            },
            getVGap: function getVGap() {
              return 20;
            },
            getHGap: function getHGap() {
              return 80;
            }
          }
        });
        graphInstance.data({
          id: network.gateway.ipAddress,
          data: network.devices[0],
          children: tree(network.devices[0])
        });
        graphInstance.render();
        graphInstance.fitView();
        setGraph(graphInstance);
      }
    }
  }, [network, graph]);

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

  const renderAction = () => {
    if (network) {
      return (
        <a
          onClick={() => {
            setNetwork(undefined);
            form.resetFields();
          }}
        >
          {intl.get('RESET')}
        </a>
      );
    }
    return <div />;
  };

  return (
    <Content>
      <PageTitle
        items={[{ title: intl.get('MENU_IMPORT_NETWORK') }]}
        actions={
          !success && (
            <Button type='primary' onClick={onSave}>
              {intl.get('SAVE_NETWORK')}
              <ImportOutlined />
            </Button>
          )
        }
      />
      <ShadowCard>
        <Form form={form} labelCol={{ span: 9 }}>
          {!success ? (
            <Row justify='space-between'>
              <Col xl={16} xxl={18}>
                <Card
                  type='inner'
                  size={'small'}
                  title={intl.get('PREVIEW')}
                  style={{ height: `${height}px` }}
                  extra={renderAction()}
                >
                  <div className='graph' style={{ height: `${height - 56}px`, width: '100%' }}>
                    {network?.devices.length ? (
                      <div id={'container'} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Dragger
                        accept={'.json'}
                        beforeUpload={onBeforeUpload}
                        showUploadList={false}
                      >
                        <p className='ant-upload-drag-icon'>
                          <InboxOutlined />
                        </p>
                        <p className='ant-upload-text'>{intl.get('UPLOAD_NETWORK_PROMPT')}</p>
                        <p className='ant-upload-hint'>{intl.get('UPLOAD_NETWORK_HINT')}</p>
                      </Dragger>
                    )}
                  </div>
                </Card>
              </Col>
              <Col xl={8} xxl={6} style={{ paddingLeft: '4px' }}>
                <Card
                  type='inner'
                  size={'small'}
                  title={intl.get('EDIT')}
                  style={{ height: `${height}px` }}
                >
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
                  <Form.Item
                    label={intl.get('POLLING_PERIOD')}
                    name={['gateway', 'polling_period']}
                  >
                    <Select>
                      {WIRELESS_HART_POLLING_PERIOD.map(({ value, text }) => (
                        <Select.Option value={value} key={value}>
                          {intl.get(text)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          ) : (
            <Result
              status='success'
              title={intl.get('NETWORK_IMPORTED_SUCCESSFUL')}
              subTitle={intl.get('NETWORK_IMPORTED_NEXT_PROMPT')}
              extra={[
                <Button type='primary' key='devices' onClick={() => navigate('/networks')}>
                  {intl.get('BACK_TO_NETWORKS')}
                </Button>,
                <Button
                  key='add'
                  onClick={() => {
                    form.resetFields();
                    setNetwork({ devices: [], wsn: {} });
                    setSuccess(false);
                  }}
                >
                  {intl.get('CONTINUE_TO_IMPORT_NETWORK')}
                </Button>
              ]}
            />
          )}
        </Form>
      </ShadowCard>
    </Content>
  );
};

export default ImportNetworkPage;
