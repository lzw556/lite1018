import { Button, Divider, Form, Input, Select } from 'antd';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CheckAlarmRuleNameRequest } from '../../../../../apis/alarm';
import MyBreadcrumb from '../../../../../components/myBreadcrumb';
import ShadowCard from '../../../../../components/shadowCard';
import { defaultValidateMessages, Normalizes, Rules } from '../../../../../constants/validator';
import { isMobile } from '../../../../../utils/deviceDetection';
import { AlarmRule } from '../props';
import { getAlarmRule, updateAlarmRule } from '../services';
import * as AppConfig from '../../../../../config';

const AlarmRuleGroupEdit = () => {
  const history = useHistory();
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [form] = Form.useForm();
  const [rule, setRule] = React.useState<AlarmRule>();
  const [smallSize, setSmallSize] = React.useState(window.innerWidth < 1300);

  React.useEffect(() => {
    window.addEventListener('resize', (e) => setSmallSize(window.innerWidth < 1300));
  }, []);
  React.useEffect(() => {
    getAlarmRule(id).then(setRule);
  }, [id]);

  React.useEffect(() => {
    if (rule) {
      form.setFieldsValue(rule);
    }
  }, [rule, form]);

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

  if (!rule) return null;
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
            <Select disabled={true} style={{ width: isMobile ? '75%' : 435 }}>
              {Object.values(AppConfig.use(window.assetCategory).measurementTypes).map(
                ({ label, id }) => (
                  <Select.Option key={id} value={id}>
                    {label}
                  </Select.Option>
                )
              )}
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
                          rules={
                            index < rule.rules.length
                              ? undefined
                              : [Rules.range(4, 16), { validator: onNameValidator }]
                          }
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
                        <Form.Item required label='周期'>
                          <Form.Item
                            {...restFields}
                            name={[name, 'duration']}
                            normalize={Normalizes.number}
                            rules={[Rules.number]}
                            initialValue={1}
                            style={{ display: 'inline-flex', marginRight: 20 }}
                          >
                            <Input style={{ width: 80 }} />
                          </Form.Item>
                          <Form.Item
                            label='条件'
                            style={{ display: 'inline-flex', marginRight: 20 }}
                            required
                          >
                            <Input.Group compact>
                              <Form.Item
                                {...restFields}
                                name={[name, 'operation']}
                                noStyle
                                initialValue='>='
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
                                    rule.rules.length > 0 && rule.rules[index]
                                      ? rule.rules[index].metric.unit
                                      : ''
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
                            style={{ display: 'inline-flex' }}
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
                    {!smallSize && (
                      <Form.Item label='名称'>
                        <Form.Item
                          {...restFields}
                          name={[name, 'name']}
                          rules={
                            index < rule.rules.length
                              ? undefined
                              : [Rules.range(4, 16), { validator: onNameValidator }]
                          }
                          style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                        >
                          <Input
                            placeholder={`请填写名称`}
                            readOnly={index < rule.rules.length}
                            style={{ width: 200 }}
                            disabled={true}
                          />
                        </Form.Item>
                        <Form.Item
                          label='指标'
                          style={{ display: 'inline-flex', marginRight: 20, marginBottom: 0 }}
                        >
                          <Input
                            disabled={true}
                            value={rule.rules[index].metric.name}
                            style={{ width: 100 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label='周期'
                          {...restFields}
                          name={[name, 'duration']}
                          normalize={Normalizes.number}
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
                              initialValue='>='
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
                                  rule.rules.length > 0 && rule.rules[index]
                                    ? rule.rules[index].metric.unit
                                    : ''
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
                  updateAlarmRule(id, final).then(() =>
                    history.replace(`alarm-management?locale=alarmRules`)
                  );
                });
              }}
            >
              保存
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

export default AlarmRuleGroupEdit;
