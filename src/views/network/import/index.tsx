import { Button, Card, Col, Form, message, Result, Row, Upload } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { ImportOutlined, InboxOutlined } from '@ant-design/icons';
import { ImportNetworkRequest } from '../../../apis/network';
import ShadowCard from '../../../components/shadowCard';
import G6, { TreeGraph } from '@antv/g6';
import '../../../components/shape/shape';
import WsnFormItem from '../../../components/formItems/wsnFormItem';
import { useProvisionMode } from '../useProvisionMode';
import { Network } from '../../../types/network';
import { useNavigate } from 'react-router';
import { PageTitle } from '../../../components/pageTitle';
import intl from 'react-intl-universal';
import { toMac } from '../../../utils/format';
import { useLocaleFormLayout } from '../../../hooks/useLocaleFormLayout';

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
  const [networkSettings, setNetworkSettings] = useState<any>();
  const [provisionMode, setProvisionMode, settings] = useProvisionMode(networkSettings);
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
    if (nodes && nodes.length && provisionMode) {
      form.validateFields().then((values) => {
        const req: NetworkRequestForm = {
          mode: provisionMode,
          wsn: values.wsn,
          devices: nodes.map((n: any) => {
            return {
              name: n.name,
              mac_address: n.address,
              parent_address: n.parentAddress,
              type_id: n.type,
              settings: n.settings
            };
          })
        };
        ImportNetworkRequest(req).then((_) => setSuccess(true));
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
            id: toMac(item.address.toUpperCase()),
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
          id: network.devices[0].address,
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
    setNetworkSettings(
      network?.wsn
        ? ({
            mode: network.wsn.provisioning_mode,
            communicationPeriod: network.wsn.communication_period,
            communicationPeriod2: network.wsn.communication_period_2,
            communicationOffset: network.wsn.communication_offset,
            groupSize: network.wsn.group_size
          } as Network)
        : undefined
    );
  }, [network]);

  useEffect(() => {
    if (network !== undefined) {
      form.setFieldsValue({
        name: network.name
      });
      setProvisionMode(network.wsn.provisioning_mode === 0 ? 1 : network.wsn.provisioning_mode);
    }
  }, [network, form, setProvisionMode]);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [form, settings]);

  const renderAction = () => {
    if (network) {
      return (
        <a
          onClick={() => {
            setNetwork(undefined);
            setGraph(undefined);
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
        <Form form={form} {...useLocaleFormLayout(9)} labelWrap={true}>
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
                  {/*<Form.Item label="通讯周期" name="communication_period"*/}
                  {/*           rules={[{required: true, message: "请选择网络通讯周期"}]}>*/}
                  {/*    <CommunicationPeriodSelect periods={COMMUNICATION_PERIOD}*/}
                  {/*                               placeholder={"请选择网络通讯周期"}/>*/}
                  {/*</Form.Item>*/}
                  {/*<Form.Item label="通讯延时" name="communication_offset"*/}
                  {/*           rules={[{required: true}]}>*/}
                  {/*    <CommunicationTimeOffsetSelect offsets={COMMUNICATION_OFFSET}*/}
                  {/*                                   placeholder={"请选择网络通讯延时"}/>*/}
                  {/*</Form.Item>*/}
                  {/*<Form.Item label="每组设备数" name="group_size" initialValue={4}*/}
                  {/*           rules={[{required: true}]}>*/}
                  {/*    <GroupSizeSelect placeholder={"请选择每组设备数"}/>*/}
                  {/*</Form.Item>*/}
                  {/*<br/>*/}
                  {network && provisionMode && (
                    <WsnFormItem mode={provisionMode} onModeChange={setProvisionMode} />
                  )}
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
