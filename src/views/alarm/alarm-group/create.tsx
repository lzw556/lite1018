import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Cascader, Col, Divider, Form, Input, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/pageTitle';
import ShadowCard from '../../../components/shadowCard';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { isMobile } from '../../../utils/deviceDetection';
import { getPropertiesByMeasurementType } from './services';
import { AlarmRule } from './types';
import { addAlarmRule } from './services';
import {
  MONITORING_POINT_TYPE,
  PLEASE_SELECT_MONITORING_POINT_TYPE,
  Property,
  getSpecificProperties,
  removeDulpicateProperties
} from '../../monitoring-point';
import { useAssetCategoryContext } from '../../asset/components/assetCategoryContext';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';

export default function CreateAlarmRuleGroup() {
  const navigate = useNavigate();
  const category = useAssetCategoryContext();
  const [form] = Form.useForm();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1500);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1500));
  }, []);

  return (
    <>
      <PageTitle
        items={[{ title: <Link to='/alarmRules'>报警规则</Link> }, { title: '添加规则' }]}
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
            <Select
              style={{ width: isMobile ? '75%' : 435 }}
              placeholder={PLEASE_SELECT_MONITORING_POINT_TYPE}
              onChange={(e) => {
                getPropertiesByMeasurementType(e).then((res) => {
                  const measurementType = MONITORING_POINTS.get(category)?.find(
                    ({ id }) => e === id
                  )?.id;
                  if (measurementType) {
                    setDisabled(false);
                    setProperties(
                      removeDulpicateProperties(getSpecificProperties(res, measurementType))
                    );
                  }
                });
                const formData: AlarmRule['rules'] = form.getFieldValue('rules');
                if (formData && formData.length > 0) {
                  form.setFieldsValue(
                    formData.map((field) => {
                      delete field.index;
                      return field;
                    })
                  );
                }
              }}
            >
              {MONITORING_POINTS.get(category)?.map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='名称' name='name' rules={[Rules.range(4, 16)]}>
            <Input placeholder={`请填写名称`} style={{ width: isMobile ? '75%' : 435 }} />
          </Form.Item>
          <Form.Item label='描述' name='description' initialValue=''>
            <Input placeholder={`请填写描述`} style={{ width: isMobile ? '75%' : 435 }} />
          </Form.Item>
          <Divider />
          <Form.List name='rules' initialValue={[0]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
                    {!smallSize && (
                      <>
                        <Form.Item
                          label='名称'
                          {...restFields}
                          name={[name, 'name']}
                          rules={[Rules.range(4, 16)]}
                          dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                        >
                          <Input
                            placeholder={`请填写名称`}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </Form.Item>
                        <Row>
                          {properties && properties.length > 0 && (
                            <Col xl={6} offset={1}>
                              <Form.Item
                                labelCol={{ span: 8 }}
                                {...restFields}
                                name={[name, 'index']}
                                label='指标'
                                rules={[{ required: true, message: '请选择指标名称' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Cascader
                                  disabled={disabled}
                                  style={{ width: '100%' }}
                                  popupClassName='alarm-rule-creation-cascader'
                                  onChange={(e, selectOptions) => {
                                    if (e !== undefined) {
                                      const property = properties.find(({ key }) => key === e[0]);
                                      if (property) {
                                        const selected = e.length === 1 ? [...e, ...e] : e;
                                        const metric = {
                                          key: selected.join('.'),
                                          name: selectOptions.map(({ name }) => name).join(':'),
                                          unit: property.unit
                                        };
                                        setMetric((prev) => {
                                          if (prev.length === 0) {
                                            return [metric];
                                          } else if (prev.length < index + 1) {
                                            return [...prev, metric];
                                          } else {
                                            return prev.map((item, n) => {
                                              if (n === index) {
                                                return metric;
                                              } else {
                                                return item;
                                              }
                                            });
                                          }
                                        });
                                      }
                                    }
                                  }}
                                  options={properties}
                                  fieldNames={{ label: 'name', value: 'key', children: 'fields' }}
                                />
                              </Form.Item>
                            </Col>
                          )}
                          <Col xl={6} offset={properties.length === 0 ? 1 : 0}>
                            <Form.Item
                              label='周期'
                              labelCol={{ span: 8 }}
                              {...restFields}
                              name={[name, 'duration']}
                              rules={[Rules.required]}
                              initialValue={1}
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
                                  metric.length > 0 && metric[index] ? metric[index].unit : ''
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col xl={5}>
                            <Form.Item
                              label='等级'
                              labelCol={{ span: 8 }}
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
                    {smallSize && (
                      <>
                        <Form.Item
                          label='名称'
                          {...restFields}
                          name={[name, 'name']}
                          rules={[Rules.range(4, 16)]}
                          dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                        >
                          <Input
                            placeholder={`请填写名称`}
                            style={{ width: isMobile ? '75%' : 435 }}
                          />
                        </Form.Item>
                        {properties && properties.length > 0 && (
                          <Form.Item
                            {...restFields}
                            name={[name, 'index']}
                            label='指标'
                            rules={[{ required: true, message: '请选择指标名称' }]}
                          >
                            <Cascader
                              disabled={disabled}
                              popupClassName='alarm-rule-creation-cascader'
                              style={{ width: isMobile ? '75%' : 435 }}
                              onChange={(e, selectOptions) => {
                                if (e !== undefined) {
                                  const property = properties.find(({ key }) => key === e[0]);
                                  if (property) {
                                    const selected = e.length === 1 ? [...e, ...e] : e;
                                    const metric = {
                                      key: selected.join('.'),
                                      name: selectOptions.map(({ name }) => name).join(':'),
                                      unit: property.unit
                                    };
                                    setMetric((prev) => {
                                      if (prev.length === 0) {
                                        return [metric];
                                      } else if (prev.length < index + 1) {
                                        return [...prev, metric];
                                      } else {
                                        return prev.map((item, n) => {
                                          if (n === index) {
                                            return metric;
                                          } else {
                                            return item;
                                          }
                                        });
                                      }
                                    });
                                  }
                                }
                              }}
                              options={properties}
                              fieldNames={{ label: 'name', value: 'key', children: 'fields' }}
                            />
                          </Form.Item>
                        )}
                        <Form.Item
                          label='周期'
                          {...restFields}
                          name={[name, 'duration']}
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
                              metric.length > 0 && metric[index] ? metric[index].unit : ''
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
                    {name !== 0 && (
                      <Button
                        icon={<MinusCircleOutlined />}
                        style={{ position: 'absolute', top: 0 }}
                        onClick={() => remove(name)}
                      />
                    )}
                    <Divider />
                  </div>
                ))}
                <Form.Item wrapperCol={{ offset: 2 }}>
                  <Button onClick={() => add()}>添加规则</Button>
                </Form.Item>
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
                    rules: values.rules.map((rule, index) => {
                      delete rule.index;
                      return {
                        ...rule,
                        duration: Number(rule.duration),
                        threshold: Number(rule.threshold),
                        metric: metric[index]
                      };
                    })
                  };
                  addAlarmRule(final).then(() => navigate(`/alarmRules`));
                });
              }}
            >
              创建
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
