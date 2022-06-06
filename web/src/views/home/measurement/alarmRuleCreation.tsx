import { Button, Form, Input } from 'antd';
import React from 'react';
import { CheckAlarmRuleNameRequest } from '../../../apis/alarm';
import { Rules } from '../../../constants/validator';

const AlarmRuleCreation = () => {
  const [form] = Form.useForm();

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
    <Form form={form} labelCol={{ span: 2 }} wrapperCol={{ span: 8 }}>
      <Form.Item
        label='名称'
        name='name'
        rules={[Rules.range(4, 16), { validator: onNameValidator }]}
      >
        <Input placeholder={`请填写名称`} />
      </Form.Item>
      <Form.Item label='描述' name='description'>
        <Input placeholder={`请填写描述`} />
      </Form.Item>
      <Form.List name='rules'>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Form.Item key={field.key}>
                <Form.Item {...field} label='报警条件' name='duration'>
                  <Input />
                </Form.Item>
              </Form.Item>
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
            form.validateFields().then((values) => console.log(values));
          }}
        >
          创建
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AlarmRuleCreation;
