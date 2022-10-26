import MyBreadcrumb from '../../../components/myBreadcrumb';
import { Button, Card, Col, Form, Input, Row, Select, Space } from 'antd';
import MeasurementTypeSelect from '../../../components/select/measurementTypeSelect';
import RuleFormItem from '../ruleFormItem';
import { Content } from 'antd/lib/layout/layout';
import { useLocation } from 'react-router-dom';
import { GetParamValue } from '../../../utils/path';
import { useEffect, useState } from 'react';
import { GetAlarmTemplateRequest, UpdateAlarmTemplateRequest } from '../../../apis/alarm';
import { GetMeasurementFieldsRequest } from '../../../apis/measurement';

const { Option } = Select;

const EditAlarmRuleTemplate = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const [fields, setFields] = useState<any>();
  const [rule, setRule] = useState<any>();
  const id = GetParamValue(location.search, 'id');

  useEffect(() => {
    if (id && Number(id) > 0) {
      GetAlarmTemplateRequest(Number(id)).then((data) => {
        setRule(data.rule);
        fetchMeasurementFields(data.measurementType);
        form.setFieldsValue({
          name: data.name,
          measurement_type: data.measurementType,
          rule: {
            ...data.rule
          },
          description: data.description,
          level: data.level
        });
      });
    }
  }, [id]);

  const fetchMeasurementFields = (measurementType: number) => {
    GetMeasurementFieldsRequest(measurementType).then(setFields);
  };

  const onSave = () => {
    form.validateFields().then((values) => {
      UpdateAlarmTemplateRequest(Number(id), values).then((_) => {
        window.location.hash = `/alarm-management?locale=alarmRules&tab=templates`;
      });
    });
  };

  return (
    <Content>
      <MyBreadcrumb />
      <Row justify='center'>
        <Col span={24}>
          <Card style={{ padding: '10px' }}>
            <Form form={form} labelCol={{ span: 8 }} labelAlign={'right'}>
              <Row justify={'start'}>
                <Col span={16}>
                  <Form.Item
                    label={'模板名称'}
                    name='name'
                    labelCol={{ span: 4 }}
                    rules={[{ required: true, message: '请输入模板名称' }]}
                  >
                    <Input placeholder='请输入模板名称' style={{ width: '225px' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify={'start'}>
                <Col span={16}>
                  <Form.Item
                    labelCol={{ span: 4 }}
                    label={'监测点类型'}
                    name='measurement_type'
                    rules={[{ required: true, message: '请选择设备类型' }]}
                  >
                    <MeasurementTypeSelect
                      placeholder={'请选择监测点类型'}
                      disabled={true}
                      style={{ width: '225px' }}
                    />
                  </Form.Item>
                  <Form.Item label={'  '} labelCol={{ span: 4 }} colon={false}>
                    <Card
                      type={'inner'}
                      bordered={false}
                      size={'small'}
                      style={{ padding: '4px', background: '#eef0f5' }}
                    >
                      <RuleFormItem fields={fields} defaultValue={rule} />
                    </Card>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify={'start'}>
                <Col span={16}>
                  <Form.Item
                    labelCol={{ span: 4 }}
                    label={'模板描述'}
                    initialValue={''}
                    name='description'
                  >
                    <Input.TextArea placeholder={'请输入描述信息'} />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify={'start'}>
                <Col span={16}>
                  <Form.Item label={'报警级别'} required labelCol={{ span: 4 }} name={'level'}>
                    <Select
                      defaultActiveFirstOption={true}
                      placeholder={'请选择报警级别'}
                      style={{ width: '200px' }}
                    >
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
                </Col>
              </Row>
              <br />
              <Row justify={'start'}>
                <Col span={16} style={{ textAlign: 'right' }}>
                  <Space>
                    <Button
                      onClick={() => {
                        window.location.hash = 'alarm-management?locale=alarmRules&tab=templates';
                      }}
                    >
                      取消
                    </Button>
                    <Button type='primary' onClick={onSave}>
                      更新
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default EditAlarmRuleTemplate;
