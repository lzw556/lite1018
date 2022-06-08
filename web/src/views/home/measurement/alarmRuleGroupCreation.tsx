import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Cascader, Divider, Form, Input, Select, Space, Typography } from 'antd';
import * as React from 'react';
import { CheckAlarmRuleNameRequest } from '../../../apis/alarm';
import { GetPropertiesRequest } from '../../../apis/property';
import { defaultValidateMessages, Normalizes, Rules } from '../../../constants/validator';
import { MeasurementTypes } from '../constants';

interface DataNode {
  label: React.ReactNode;
  title?: string;
  value: string | number;
  disabled?: boolean;
  children?: DataNode[];
  isLeaf?: boolean;
  loading?: boolean;
  firstClassProperties?: string[];
}

const AlarmRuleGroupCreation = () => {
  const [form] = Form.useForm();
  const [options, setOptions] = React.useState<DataNode[]>(
    Object.values(MeasurementTypes)
      .filter((type) => type.id !== 10102)
      .map(({ label, deviceType, firstClassProperties }) => ({
        value: deviceType,
        label,
        isLeaf: false,
        firstClassProperties
      }))
  );
  const [properties, setProperties] = React.useState<any[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);

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
  return (
    <Form
      form={form}
      labelCol={{ span: 2 }}
      wrapperCol={{ span: 8 }}
      validateMessages={defaultValidateMessages}
    >
      <Form.Item
        label='名称'
        name='name'
        rules={[Rules.range(4, 16), { validator: onNameValidator }]}
      >
        <Input placeholder={`请填写名称`} />
      </Form.Item>
      <Form.Item label='描述' name='description' initialValue=''>
        <Input placeholder={`请填写描述`} />
      </Form.Item>
      <Divider />
      <Form.List name='rules'>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restFields }, index) => (
              <div key={key} style={{ position: 'relative' }}>
                <Form.Item
                  label='名称'
                  {...restFields}
                  name={[name, 'name']}
                  rules={[Rules.range(4, 16), { validator: onNameValidator }]}
                >
                  <Input placeholder={`请填写名称`} />
                </Form.Item>
                <Form.Item
                  label='描述'
                  {...restFields}
                  name={[name, 'description']}
                  initialValue=''
                >
                  <Input placeholder={`请填写描述`} />
                </Form.Item>
                <Form.Item
                  {...restFields}
                  name={[name, 'index']}
                  label='指标名称'
                  rules={[{ required: true, message: '请选择指标名称' }]}
                >
                  <Cascader
                    placeholder={'请选择指标名称'}
                    options={options}
                    loadData={(selectedOptions: any) => {
                      const targetOption = selectedOptions[selectedOptions.length - 1];
                      targetOption.loading = true;
                      GetPropertiesRequest(Number(targetOption.value))
                        .then((data) => {
                          targetOption.loading = false;
                          const properties = data.filter((property) =>
                            targetOption.firstClassProperties?.find((key: any) => key === property.key)
                          );
                          targetOption.children = properties.map((item) => {
                            return { value: item.key, label: item.name };
                          });
                          setOptions([...options]);
                          setProperties(properties);
                        })
                        .catch((_) => {
                          targetOption.loading = false;
                        });
                    }}
                    onChange={(values: any) => {
                      console.log(values)
                      let prop = properties.find((item) => item.key === values[values.length - 1]);
                      if (prop && prop.fields.length === 1) {
                        setMetric((prev) => [
                          ...prev,
                          {
                            key: prop.key + '.' + prop.fields[0].key,
                            name: prop.name,
                            unit: prop.unit
                          }
                        ]);
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item label='报警条件'>
                  <Space direction='vertical'>
                    <Space>
                      <Typography.Text type={'secondary'}>当监控对象连续</Typography.Text>
                      <Form.Item
                        {...restFields}
                        name={[name, 'duration']}
                        normalize={Normalizes.number}
                        noStyle
                        rules={[Rules.number]}
                        initialValue={1}
                      >
                        <Input size={'small'} style={{ width: '64px' }} />
                      </Form.Item>
                      <Typography.Text type={'secondary'}>个周期内</Typography.Text>
                    </Space>
                    <Space>
                      <Form.Item
                        {...restFields}
                        name={[name, 'operation']}
                        noStyle
                        initialValue={'>='}
                      >
                        <Select size={'small'} style={{ width: '64px' }}>
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
                          size={'small'}
                          style={{ width: '64px' }}
                          suffix={metric.length > 0 && metric[index] ? metric[index].unit : ''}
                        />
                      </Form.Item>
                      <Typography.Text type={'secondary'}>时</Typography.Text>
                    </Space>
                    <Space>
                      <Typography.Text type={'secondary'}>产生</Typography.Text>
                      <Form.Item {...restFields} name={[name, 'level']} noStyle initialValue={3}>
                        <Select size={'small'} style={{ width: '88px' }}>
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
                      <Typography.Text type={'secondary'}>报警</Typography.Text>
                    </Space>
                  </Space>
                </Form.Item>
                <Button
                  icon={<MinusCircleOutlined />}
                  style={{ position: 'absolute', top: 0 }}
                  onClick={() => remove(name)}
                />
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
            form.validateFields().then(
              (values: {
                name: string;
                description: string;
                rules: {
                  name: string;
                  description: string;
                  category: number;
                  duration: number;
                  level: number;
                  operation: string;
                  threshold: number;
                  source_type: number;
                  metric: { key: string; name: string; unit: string }[];
                  index: any;
                }[];
              }) => {
                const final = {
                  ...values,
                  type: 2,
                  rules: values.rules.map((rule, index) => ({
                    ...rule,
                    threshold: Number(rule.threshold),
                    category: 2,
                    metric: metric[index]
                  }))
                };
                console.log(final);
              }
            );
          }}
        >
          创建
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AlarmRuleGroupCreation;
