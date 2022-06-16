import { Button, Divider, Form, Input, Select } from 'antd';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { CheckAlarmRuleNameRequest } from '../../../../apis/alarm';
import MyBreadcrumb from '../../../../components/myBreadcrumb';
import ShadowCard from '../../../../components/shadowCard';
import { defaultValidateMessages, Normalizes, Rules } from '../../../../constants/validator';
import { MeasurementTypes } from '../../common/constants';
import { AlarmRule } from '../props';
import { getAlarmRule, updateAlarmRule } from '../services';

const AlarmRuleGroupEdit = () => {
  const history = useHistory();
  const { search } = useLocation();
  const id = Number(search.substring(search.lastIndexOf('id=') + 3));
  const [form] = Form.useForm();
  const [rule, setRule] = React.useState<AlarmRule>();
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
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 8 }}
          validateMessages={defaultValidateMessages}
        >
          <Form.Item
            label='监测点类型'
            name='type'
            rules={[{ required: true, message: '请选择监测点类型' }]}
          >
            <Select disabled={true} style={{ width: '25%', minWidth: 80 }}>
              {Object.values(MeasurementTypes).map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='名称' name='name'>
            <Input placeholder={`请填写名称`} />
          </Form.Item>
          <Form.Item label='描述' name='description'>
            <Input placeholder={`请填写描述`} />
          </Form.Item>
          <Divider />
          <Form.List name='rules'>
            {(fields) => (
              <>
                {fields.map(({ key, name, ...restFields }, index) => (
                  <div key={key} style={{ position: 'relative' }}>
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
                      <Input placeholder={`请填写名称`} readOnly={index < rule.rules.length} />
                    </Form.Item>
                    <Form.Item label='描述' {...restFields} name={[name, 'description']}>
                      <Input placeholder={`请填写描述`} />
                    </Form.Item>
                    <Form.Item
                      label='周期'
                      {...restFields}
                      name={[name, 'duration']}
                      normalize={Normalizes.number}
                      rules={[Rules.number]}
                      initialValue={1}
                    >
                      <Input style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item label='条件'>
                      <Input.Group compact style={{ width: '50%' }}>
                        <Form.Item
                          {...restFields}
                          name={[name, 'operation']}
                          noStyle
                          initialValue='>='
                        >
                          <Select style={{ width: '30%', minWidth: 80 }}>
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
                            style={{ width: '70%' }}
                            suffix={
                              rule.rules.length > 0 && rule.rules[index]
                                ? rule.rules[index].metric.unit
                                : ''
                            }
                          />
                        </Form.Item>
                      </Input.Group>
                    </Form.Item>
                    <Form.Item label='等级' {...restFields} name={[name, 'level']} initialValue={3}>
                      <Select style={{ width: '15%', minWidth: 80 }}>
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
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
};

export default AlarmRuleGroupEdit;
