import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Select } from 'antd';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { CheckAlarmRuleNameRequest } from '../../../../../apis/alarm';
import MyBreadcrumb from '../../../../../components/myBreadcrumb';
import ShadowCard from '../../../../../components/shadowCard';
import { defaultValidateMessages, Rules } from '../../../../../constants/validator';
import { MeasurementTypes } from '../../../common/constants';
import { AlarmRule } from '../props';
import { addAlarmRule, getPropertiesByMeasurementType } from '../services';

const AlarmRuleGroupCreation = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);
  const [disabled, setDisabled] = React.useState(true);

  const onNameValidator = (rule: any, value: any) => {
    return new Promise<void>((resolve, reject) => {
      if (!value) {
        resolve();
        return;
      }
      const rules: AlarmRule[] = form.getFieldValue('rules');
      if (rules.filter(({ name }) => name === value).length > 1) {
        reject('规则名称不能重复');
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
              style={{ width: 435 }}
              onChange={(e) => {
                getPropertiesByMeasurementType(e).then((res) => {
                  const measurementType = Object.values(MeasurementTypes).find(
                    ({ id }) => e === id
                  );
                  if (measurementType) {
                    setDisabled(false);
                    setProperties(
                      res.filter((property) =>
                        measurementType.firstClassFieldKeys.find((key: any) => key === property.key)
                      )
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
              {Object.values(MeasurementTypes).map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='名称' name='name' rules={[Rules.range(4, 16)]}>
            <Input placeholder={`请填写名称`} style={{ width: 435 }} />
          </Form.Item>
          <Form.Item label='描述' name='description' initialValue=''>
            <Input placeholder={`请填写描述`} style={{ width: 435 }} />
          </Form.Item>
          <Divider />
          <Form.List name='rules' initialValue={[0]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
                    <Form.Item
                      label='名称'
                      {...restFields}
                      name={[name, 'name']}
                      rules={[Rules.range(4, 16), { validator: onNameValidator }]}
                      dependencies={index === 0 ? undefined : ['user', index - 1, 'name']}
                    >
                      <Input placeholder={`请填写名称`} style={{ width: 435 }} />
                    </Form.Item>
                    {properties && properties.length > 0 && (
                      <Form.Item
                        {...restFields}
                        name={[name, 'index']}
                        label='指标名称'
                        rules={[{ required: true, message: '请选择指标名称' }]}
                      >
                        <Select
                          disabled={disabled}
                          style={{ width: 435 }}
                          onChange={(e) => {
                            const property = properties.find(({ key }) => e === key);
                            if (property && property.fields && property.fields.length > 0) {
                              const metric = {
                                key: property.key + '.' + property.fields[0].key,
                                name: property.name,
                                unit: property.unit
                              };
                              setMetric((prev) => {
                                if (prev.length === 0) {
                                  return [metric];
                                } else if (prev.length < index + 1){
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
                          }}
                        >
                          {properties.map(({ name, key }) => (
                            <Select.Option key={key} value={key}>
                              {name}
                            </Select.Option>
                          ))}
                        </Select>
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
                              suffix={metric.length > 0 && metric[index] ? metric[index].unit : ''}
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
                    rules: values.rules.map((rule, index) => ({
                      ...rule,
                      duration: Number(rule.duration),
                      threshold: Number(rule.threshold),
                      metric: metric[index],
                      index: [values.type, rule.index]
                    }))
                  };
                  console.log(final);
                  addAlarmRule(final).then(() =>
                    history.replace(`alarm-management?locale=alarmRules`)
                  );
                });
              }}
            >
              创建
            </Button>&nbsp;&nbsp;&nbsp;
            <Button type='primary' onClick={() => history.go(-1)}>取消</Button>
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
};

export default AlarmRuleGroupCreation;
