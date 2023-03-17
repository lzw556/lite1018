import { Button, Col, Divider, Form, Input, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageTitle } from '../../../components/pageTitle';
import ShadowCard from '../../../components/shadowCard';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import { defaultValidateMessages, Normalizes, Rules } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import { useAssetCategoryContext } from '../../asset/components/assetCategoryContext';
import { MONITORING_POINT_TYPE, PLEASE_SELECT_MONITORING_POINT_TYPE } from '../../monitoring-point';
import { getAlarmRule, updateAlarmRule } from './services';
import { AlarmRule } from './types';

export default function UpdateAlarmRuleGroup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const category = useAssetCategoryContext();

  const [form] = Form.useForm();
  const [rule, setRule] = React.useState<AlarmRule>();
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1500);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1500));
  }, []);
  React.useEffect(() => {
    getAlarmRule(Number(id)).then(setRule);
  }, [id]);

  React.useEffect(() => {
    if (rule) {
      form.setFieldsValue(rule);
    }
  }, [rule, form]);

  if (!rule) return null;
  return (
    <>
      <PageTitle
        items={[{ title: <Link to='/alarmRules'>报警规则</Link> }, { title: '编辑规则' }]}
      />
      <ShadowCard>
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
          validateMessages={defaultValidateMessages}
        >
          <Form.Item
            label={MONITORING_POINT_TYPE}
            name='type'
            rules={[{ required: true, message: PLEASE_SELECT_MONITORING_POINT_TYPE }]}
          >
            <Select disabled={true} style={{ width: isMobile ? '75%' : 435 }}>
              {MONITORING_POINTS.get(category)?.map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='名称' name='name'>
            <Input placeholder={`请填写名称`} style={{ width: isMobile ? '75%' : 435 }} />
          </Form.Item>
          <Form.Item label='描述' name='description'>
            <Input placeholder={`请填写描述`} style={{ width: isMobile ? '75%' : 435 }} />
          </Form.Item>
          <Divider />
          <Form.List name='rules'>
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
                    {smallSize && (
                      <>
                        <Form.Item
                          label='名称'
                          {...restFields}
                          name={[name, 'name']}
                          rules={index < rule.rules.length ? undefined : [Rules.range(4, 16)]}
                        >
                          <Input
                            placeholder={`请填写名称`}
                            readOnly={index < rule.rules.length}
                            style={{ width: isMobile ? '75%' : 435 }}
                            disabled={true}
                          />
                        </Form.Item>
                        <Form.Item label='指标'>
                          <Input
                            disabled={true}
                            value={rule.rules[index].metric.name}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label='周期'
                          {...restFields}
                          name={[name, 'duration']}
                          normalize={Normalizes.number}
                          rules={[Rules.required]}
                          initialValue={1}
                        >
                          <InputNumber controls={false} style={{ width: isMobile ? '75%' : 435 }} />
                        </Form.Item>
                        <Form.Item
                          label='条件'
                          {...restFields}
                          name={[name, 'threshold']}
                          rules={[Rules.required]}
                        >
                          <InputNumber
                            style={{ width: isMobile ? '75%' : 435 }}
                            addonBefore={
                              <Form.Item
                                {...restFields}
                                name={[name, 'operation']}
                                noStyle
                                initialValue={'>='}
                              >
                                <Select style={{ width: 65 }}>
                                  <Select.Option key={'>'} value={'>'}>
                                    &gt;
                                  </Select.Option>
                                  <Select.Option key={'>='} value={'>='}>
                                    &gt;=
                                  </Select.Option>
                                  <Select.Option key={'<'} value={'<'}>
                                    &lt;
                                  </Select.Option>
                                  <Select.Option key={'<='} value={'<='}>
                                    &lt;=
                                  </Select.Option>
                                </Select>
                              </Form.Item>
                            }
                            controls={false}
                            addonAfter={
                              rule.rules.length > 0 && rule.rules[index]
                                ? rule.rules[index].metric.unit
                                : ''
                            }
                          />
                        </Form.Item>
                        <Form.Item
                          label='等级'
                          {...restFields}
                          name={[name, 'level']}
                          initialValue={3}
                        >
                          <Select style={{ width: isMobile ? '75%' : 435 }}>
                            <Select.Option key={1} value={1}>
                              次要
                            </Select.Option>
                            <Select.Option key={2} value={2}>
                              重要
                            </Select.Option>
                            <Select.Option key={3} value={3}>
                              紧急
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </>
                    )}
                    {!smallSize && (
                      <>
                        <Form.Item label='名称' {...restFields} name={[name, 'name']}>
                          <Input style={{ width: isMobile ? '75%' : 435 }} disabled={true} />
                        </Form.Item>
                        <Row>
                          <Col xl={6} offset={1}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label='指标'
                              style={{ marginBottom: 0 }}
                            >
                              <Input disabled={true} value={rule.rules[index].metric.name} />
                            </Form.Item>
                          </Col>
                          <Col xl={6}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label='周期'
                              {...restFields}
                              name={[name, 'duration']}
                              initialValue={1}
                              rules={[Rules.required]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber controls={false} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                          <Col xl={6}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label='条件'
                              style={{ marginBottom: 0 }}
                              {...restFields}
                              name={[name, 'threshold']}
                              rules={[Rules.required]}
                            >
                              <InputNumber
                                addonBefore={
                                  <Form.Item
                                    {...restFields}
                                    name={[name, 'operation']}
                                    noStyle
                                    initialValue={'>='}
                                  >
                                    <Select style={{ width: 65 }}>
                                      <Select.Option key={'>'} value={'>'}>
                                        &gt;
                                      </Select.Option>
                                      <Select.Option key={'>='} value={'>='}>
                                        &gt;=
                                      </Select.Option>
                                      <Select.Option key={'<'} value={'<'}>
                                        &lt;
                                      </Select.Option>
                                      <Select.Option key={'<='} value={'<='}>
                                        &lt;=
                                      </Select.Option>
                                    </Select>
                                  </Form.Item>
                                }
                                controls={false}
                                addonAfter={
                                  rule.rules.length > 0 && rule.rules[index]
                                    ? rule.rules[index].metric.unit
                                    : ''
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col xl={5}>
                            <Form.Item
                              labelCol={{ span: 8 }}
                              label='等级'
                              {...restFields}
                              name={[name, 'level']}
                              initialValue={3}
                              style={{ marginBottom: 0 }}
                            >
                              <Select style={{ width: 120 }}>
                                <Select.Option key={1} value={1}>
                                  次要
                                </Select.Option>
                                <Select.Option key={2} value={2}>
                                  重要
                                </Select.Option>
                                <Select.Option key={3} value={3}>
                                  紧急
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    )}
                    <Divider />
                  </div>
                ))}
              </>
            )}
          </Form.List>
          <Form.Item wrapperCol={{ offset: 2 }}>
            <Button
              type='primary'
              onClick={() => {
                form.validateFields().then((values: AlarmRule) => {
                  const final = {
                    ...values,
                    category: 2,
                    rules: values.rules.map((_rule) => ({
                      ..._rule,
                      threshold: Number(_rule.threshold),
                      description: _rule.description || ''
                    }))
                  };
                  updateAlarmRule(Number(id), final).then(() => navigate(`alarmRules`));
                });
              }}
            >
              保存
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type='primary' onClick={() => navigate(-1)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
}
