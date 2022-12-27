import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Cascader, Divider, Form, Input, Select } from 'antd';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MyBreadcrumb from '../../../../../components/myBreadcrumb';
import ShadowCard from '../../../../../components/shadowCard';
import { defaultValidateMessages, Rules } from '../../../../../constants/validator';
import { isMobile } from '../../../../../utils/deviceDetection';
import { AlarmRule, Property } from '../props';
import { addAlarmRule, getPropertiesByMeasurementType } from '../services';
import * as AppConfig from '../../../../../config';
import {
  getSpecificProperties,
  removeDulpicateProperties
} from '../../../common/historyDataHelper';

const AlarmRuleGroupCreation = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1300);
  const measurementTypes = AppConfig.getMeasurementTypes(window.assetCategory);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1300));
  }, []);

  return (
    <>
      <MyBreadcrumb />
      <ShadowCard>
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 18 }}
          validateMessages={defaultValidateMessages}
        >
          <Form.Item
            label='监测点类型'
            name='type'
            rules={[{ required: true, message: '请选择监测点类型' }]}
          >
            <Select
              style={{ width: isMobile ? '75%' : 435 }}
              onChange={(e) => {
                getPropertiesByMeasurementType(e).then((res) => {
                  const measurementType = measurementTypes.find(({ id }) => e === id);
                  if (measurementType) {
                    setDisabled(false);
                    setProperties(
                      removeDulpicateProperties(getSpecificProperties(res, measurementType.id))
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
              {measurementTypes
                .filter((type) => !type.hidden)
                .map(({ label, id }) => (
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
                      <Form.Item label='名称' required>
                        <Form.Item
                          {...restFields}
                          name={[name, 'name']}
                          rules={[Rules.range(4, 16)]}
                          dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                          style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                        >
                          <Input placeholder={`请填写名称`} style={{ width: 200 }} />
                        </Form.Item>
                        {properties && properties.length > 0 && (
                          <Form.Item
                            {...restFields}
                            name={[name, 'index']}
                            label='指标'
                            rules={[{ required: true, message: '请选择指标名称' }]}
                            style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                          >
                            <Cascader
                              disabled={disabled}
                              style={{ width: 100 }}
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
                          rules={[Rules.number]}
                          initialValue={1}
                          style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                        >
                          <Input style={{ width: 70 }} />
                        </Form.Item>
                        <Form.Item
                          label='条件'
                          style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                          required
                        >
                          <Input.Group compact>
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
                            <Form.Item
                              {...restFields}
                              name={[name, 'threshold']}
                              rules={[Rules.number]}
                              noStyle
                            >
                              <Input
                                style={{ width: 80 }}
                                suffix={
                                  metric.length > 0 && metric[index] ? metric[index].unit : ''
                                }
                              />
                            </Form.Item>
                          </Input.Group>
                        </Form.Item>
                        <Form.Item
                          label='等级'
                          {...restFields}
                          name={[name, 'level']}
                          initialValue={3}
                          style={{ display: 'inline-flex', marginBottom: 0 }}
                        >
                          <Select style={{ width: 80 }}>
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
                      </Form.Item>
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
                        <Form.Item label='周期' required>
                          <Form.Item
                            {...restFields}
                            name={[name, 'duration']}
                            rules={[Rules.number]}
                            initialValue={1}
                            style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                          >
                            <Input style={{ width: 80 }} />
                          </Form.Item>
                          <Form.Item
                            label='条件'
                            style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                            required
                          >
                            <Input.Group compact>
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
                              <Form.Item
                                {...restFields}
                                name={[name, 'threshold']}
                                rules={[Rules.number]}
                                noStyle
                              >
                                <Input
                                  style={{ width: 80 }}
                                  suffix={
                                    metric.length > 0 && metric[index] ? metric[index].unit : ''
                                  }
                                />
                              </Form.Item>
                            </Input.Group>
                          </Form.Item>
                          <Form.Item
                            label='等级'
                            {...restFields}
                            name={[name, 'level']}
                            initialValue={3}
                            style={{ display: 'inline-flex', marginBottom: 0 }}
                          >
                            <Select style={{ width: 80 }}>
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
                  addAlarmRule(final).then(() =>
                    history.replace(`alarm-management?locale=alarmRules`)
                  );
                });
              }}
            >
              创建
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type='primary' onClick={() => history.go(-1)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
};

export default AlarmRuleGroupCreation;
