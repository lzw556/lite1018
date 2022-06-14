import { MinusCircleOutlined } from '@ant-design/icons';
import { Button, Cascader, Divider, Form, Input, Select } from 'antd';
import * as React from 'react';
import { CheckAlarmRuleNameRequest } from '../../../../apis/alarm';
import MyBreadcrumb from '../../../../components/myBreadcrumb';
import ShadowCard from '../../../../components/shadowCard';
import { defaultValidateMessages, Normalizes, Rules } from '../../../../constants/validator';
import { MeasurementTypes } from '../../common/constants';
import { AlarmRule } from '../props';
import { addAlarmRule, getPropertiesByMeasurementType } from '../services';

interface DataNode {
  label: React.ReactNode;
  title?: string;
  value: string | number;
  disabled?: boolean;
  children?: DataNode[];
  isLeaf?: boolean;
  loading?: boolean;
  firstClassFieldKeys?: string[];
}

const AlarmRuleGroupCreation = () => {
  const [form] = Form.useForm();
  const [options, setOptions] = React.useState<DataNode[]>(
    Object.values(MeasurementTypes).map(({ label, id, firstClassFieldKeys }) => ({
      value: id,
      label,
      isLeaf: false,
      firstClassFieldKeys
    }))
  );
  const [properties, setProperties] = React.useState<any[]>([]);
  const [metric, setMetric] = React.useState<{ key: string; name: string; unit: string }[]>([]);
  const [source_type, setSource_type] = React.useState();

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
            <Select style={{ width: '25%', minWidth: 80 }} onChange={(e) => setSource_type(e)}>
              {Object.values(MeasurementTypes).map(({ label, id }) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
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
                          getPropertiesByMeasurementType(Number(targetOption.value))
                            .then((data) => {
                              targetOption.loading = false;
                              const properties = data.filter((property) =>
                                targetOption.firstClassFieldKeys?.find(
                                  (key: any) => key === property.key
                                )
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
                          console.log(values);
                          let prop = properties.find(
                            (item) => item.key === values[values.length - 1]
                          );
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
                          initialValue={'>='}
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
                            suffix={metric.length > 0 && metric[index] ? metric[index].unit : ''}
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
                      threshold: Number(rule.threshold),
                      category: 2,
                      source_type,
                      metric: metric[index]
                    }))
                  };
                  addAlarmRule(final);
                });
              }}
            >
              创建
            </Button>
          </Form.Item>
        </Form>
      </ShadowCard>
    </>
  );
};

export default AlarmRuleGroupCreation;
