import {
  Button,
  Card,
  Cascader,
  Col,
  Form,
  Input,
  Result,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Typography
} from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { AddAlarmRuleRequest, CheckAlarmRuleNameRequest } from '../../../apis/alarm';
import MyBreadcrumb from '../../../components/myBreadcrumb';
import ShadowCard from '../../../components/shadowCard';
import SourceSelectModal from './modal/sourceSelectModal';
import { DeleteOutlined } from '@ant-design/icons';
import { defaultValidateMessages, Normalizes, Rules } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import _ from 'lodash';
import { GetPropertiesRequest } from '../../../apis/property';
import { DeviceType } from '../../../types/device_type';

const { Option } = Select;
const { TabPane } = Tabs;

const AddAlarmRule = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [options, setOptions] = useState<any>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>();
  const [property, setProperty] = useState<any>();
  const [deviceType, setDeviceType] = useState<DeviceType>(0);
  const [metric, setMetric] = useState<any>();
  const [category, setCategory] = useState<any>('1');
  const [form] = Form.useForm();
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    form.setFieldsValue({
      duration: 1,
      operation: '>=',
      level: 3
    });
    setOptions(
      DeviceType.sensors().map((item) => {
        return { value: item, label: DeviceType.toString(item), isLeaf: false };
      })
    );
  }, []);

  const onAdd = () => {
    form.validateFields().then((values) => {
      values.threshold = parseFloat(values.threshold);
      if (selected && selected.sources.length > 0) {
        values.source_ids = selected.sources.map((item: any) => item.id);
      }
      values.source_type = deviceType;
      values.category = parseInt(category);
      values.metric = metric;
      AddAlarmRuleRequest(values).then((data) => {
        setSuccess(true);
      });
    });
  };

  const onNameValidator = (rule: any, value: any) => {
    return new Promise<void>((resolve, reject) => {
      if (!value) {
        reject('输入不能为空');
        return;
      }
      CheckAlarmRuleNameRequest(value)
        .then((data) => {
          if (data) {
            resolve();
          } else {
            reject('该名称已存在');
          }
        })
        .catch((_) => reject('该名称已存在'));
    });
  };

  const onRemoveSource = (id: any) => {
    const newSelected = _.cloneDeep(selected);
    newSelected.sources = newSelected.sources.filter((item: any) => item.id !== id);
    setSelected(newSelected);
  };

  const onLoadData = (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    GetPropertiesRequest(targetOption.value)
      .then((data) => {
        targetOption.loading = false;
        targetOption.children = data.map((item) => {
          return { value: item.key, label: item.name };
        });
        setProperties(data);
        setOptions([...options]);
      })
      .catch((_) => {
        targetOption.loading = false;
      });
  };

  const sourceColumns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      width: '40%'
    },
    {
      title: '指标名称',
      dataIndex: 'index',
      key: 'index',
      width: '40%',
      render: (text: any, record: any) => {
        return metric?.name;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (text: any, record: any) => {
        return (
          <Space>
            <Button
              type='text'
              size='small'
              icon={<DeleteOutlined />}
              danger
              onClick={() => onRemoveSource(record.id)}
            />
          </Space>
        );
      }
    }
  ];

  const onDropdownRender = (options: any) => {
    return (
      <Tabs defaultActiveKey={'1'} style={{ padding: '0 10px 0 10px' }} onChange={setCategory}>
        <TabPane tab={'设备'} key={'1'}>
          {options}
        </TabPane>
      </Tabs>
    );
  };

  const renderAlarmRuleForm = () => {
    return (
      <Form form={form} validateMessages={defaultValidateMessages}>
        <ShadowCard>
          <Row justify={'space-between'}>
            <Col span={24}>
              <Form.Item
                label={'规则名称'}
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 8 }}
                name={'name'}
                required
                rules={[Rules.range(4, 16), { validator: onNameValidator }]}
              >
                <Input placeholder={'请输入规则名称'} />
              </Form.Item>
            </Col>
          </Row>
          <Row justify={'space-between'}>
            <Col span={24}>
              <Form.Item
                label={'规则描述'}
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 12 }}
                initialValue={''}
                name={'description'}
              >
                <Input.TextArea placeholder={'请输入规则描述'} />
              </Form.Item>
            </Col>
          </Row>
        </ShadowCard>
        <ShadowCard>
          <Form.Item
            label={'指标名称'}
            name={'index'}
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 6 }}
            rules={[Rules.required]}
          >
            <Cascader
              placeholder={'请选择指标名称'}
              options={options}
              loadData={onLoadData}
              dropdownRender={onDropdownRender}
              onChange={(values: any) => {
                setDeviceType(values[0]);
                let prop = properties.find((item) => item.key === values[values.length - 1]);
                setProperty(prop);
                if (prop && prop.fields.length === 1) {
                  setMetric({
                    key: prop.key + '.' + prop.fields[0].key,
                    name: prop.name,
                    unit: prop.unit
                  });
                }
              }}
            />
          </Form.Item>
          {property && property.fields.length > 1 && (
            <Form.Item
              label={'指标维度'}
              name={'dimension'}
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 6 }}
              rules={[Rules.required]}
            >
              <Select
                placeholder={'请选择指标维度'}
                onChange={(value) => {
                  let field = property.fields.find((item: any) => item.key === value);
                  if (field) {
                    setMetric({
                      key: property.key + '.' + field.key,
                      name: `${property.name}(${field.name})`,
                      unit: property.unit
                    });
                  }
                }}
              >
                {property.fields.map((item: any) => {
                  return (
                    <Select.Option key={item.key} value={item.key}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}
          <Row justify={'start'}>
            <Col span={24}>
              <Form.Item label={'监控对象'} labelCol={{ span: 2 }} requiredMark={true}>
                <Row justify={'start'}>
                  <Col span={24}>
                    <Card style={{ border: 'dashed 1px #ccc', backgroundColor: '#f4f4f4' }}>
                      <Row justify={'center'}>
                        <Col>
                          <Typography.Text>请您选择要监控的对象</Typography.Text>
                        </Col>
                      </Row>
                      <br />
                      <Row justify={'center'}>
                        <Col>
                          <Button
                            type={'primary'}
                            size={'small'}
                            disabled={selected && selected.sources && selected.sources.length > 0}
                            onClick={(_) => setVisible(true)}
                          >
                            选择资源对象
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
                <Row justify={'start'}>
                  <Col span={24}>
                    {selected && selected.sources && selected.sources.length > 0 && (
                      <Table
                        rowKey={(record) => record.id}
                        columns={sourceColumns}
                        size={'small'}
                        dataSource={selected.sources}
                        pagination={false}
                      />
                    )}
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
          <Row justify={'space-between'}>
            <Col span={24}>
              <Form.Item label={'报警条件'} labelCol={{ span: 2 }}>
                <Row justify={'start'} style={{ paddingTop: '8px' }}>
                  <Col span={24}>
                    <Card>
                      <Row justify={'space-between'}>
                        <Col span={isMobile ? 24 : 3}>
                          <Typography.Text strong>触发条件</Typography.Text>
                        </Col>
                        <Col span={isMobile ? 24 : 20}>
                          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
                            <Typography.Text type={'secondary'}>
                              当<Typography.Text strong>监控对象</Typography.Text>连续
                            </Typography.Text>
                            <Form.Item
                              name={['duration']}
                              normalize={Normalizes.number}
                              noStyle
                              rules={[Rules.number]}
                            >
                              <Input size={'small'} style={{ width: '64px' }} />
                            </Form.Item>
                            <Typography.Text type={'secondary'}>个周期内</Typography.Text>
                            <Form.Item name={['operation']} noStyle>
                              <Select size={'small'} style={{ width: '64px' }}>
                                <Option key={'>'} value={'>'}>
                                  &gt;
                                </Option>
                                <Option key={'>='} value={'>='}>
                                  &gt;=
                                </Option>
                                <Option key={'<'} value={'<'}>
                                  &lt;
                                </Option>
                                <Option key={'<='} value={'<='}>
                                  &lt;=
                                </Option>
                              </Select>
                            </Form.Item>
                            <Form.Item name={['threshold']} rules={[Rules.number]} noStyle>
                              <Input
                                size={'small'}
                                style={{ width: '64px' }}
                                suffix={metric?.unit}
                              />
                            </Form.Item>
                            <Typography.Text type={'secondary'}>时, 产生</Typography.Text>
                            <Form.Item name={['level']} noStyle>
                              <Select size={'small'} style={{ width: '88px' }}>
                                <Option key={1} value={1}>
                                  次要
                                </Option>
                                <Option key={2} value={2}>
                                  重要
                                </Option>
                                <Option key={3} value={3}>
                                  紧急
                                </Option>
                              </Select>
                            </Form.Item>
                            <Typography.Text type={'secondary'}>报警</Typography.Text>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
          <Row justify={'end'} style={{ textAlign: 'right' }}>
            <Col span={24}>
              <Space>
                <Button
                  onClick={() => {
                    window.location.hash = 'alarm-management?locale=alarmRules&tab=rules';
                  }}
                >
                  取消
                </Button>
                <Button type={'primary'} onClick={onAdd}>
                  创建
                </Button>
              </Space>
            </Col>
          </Row>
        </ShadowCard>
      </Form>
    );
  };

  return (
    <Content>
      <MyBreadcrumb />
      {success ? (
        <ShadowCard>
          <Result
            status='success'
            title='报警规则创建成功!'
            subTitle='您可以返回规则列表查看报警规则信息或者继续创建报警规则'
            extra={[
              <Button
                type='primary'
                key='alarmRules'
                onClick={() => {
                  window.location.hash = 'alarm-management?locale=alarmRules';
                }}
              >
                返回规则列表
              </Button>,
              <Button
                key='add'
                onClick={() => {
                  form.resetFields();
                  setSelected(undefined);
                  setSuccess(false);
                }}
              >
                继续创建报警规则
              </Button>
            ]}
          />
        </ShadowCard>
      ) : (
        renderAlarmRuleForm()
      )}
      <SourceSelectModal
        visible={visible}
        deviceType={deviceType}
        onCancel={() => setVisible(false)}
        onSuccess={(value) => {
          setSelected(value);
          setVisible(false);
        }}
      />
    </Content>
  );
};

export default AddAlarmRule;
