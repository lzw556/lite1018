import { Form, Input, Modal, ModalProps, Select } from 'antd';
import { FC } from 'react';
import { Rules } from '../../../../constants/validator';

export interface PermissionModalProps extends ModalProps {
  form: any;
}

const { Option } = Select;

const PermissionModal: FC<PermissionModalProps> = (props) => {
  const { form } = props;

  return (
    <Modal {...props}>
      <Form form={form} labelCol={{ span: 6 }}>
        <Form.Item
          name='path'
          label={'权限路径'}
          rules={[{ required: true, message: '请输入权限路径' }]}
        >
          <Input placeholder='请输入权限路径' />
        </Form.Item>
        <Form.Item name={'method'} label={'请求方法'} rules={[Rules.required]}>
          <Select placeholder='请选择请求方法'>
            <Option key={'GET'} value='GET'>
              GET
            </Option>
            <Option key={'POST'} value='POST'>
              POST
            </Option>
            <Option key={'PUT'} value='PUT'>
              PUT
            </Option>
            <Option key={'PATCH'} value={'PATCH'}>
              PATCH
            </Option>
            <Option key={'DELETE'} value='DELETE'>
              DELETE
            </Option>
          </Select>
        </Form.Item>
        <Form.Item name={'description'} label={'权限描述'}>
          <Input placeholder={'请输入权限描述'} />
        </Form.Item>
        <Form.Item name={'group'} label={'分组'} rules={[Rules.required]}>
          <Select placeholder={'请选择分组'}>
            <Option key={'asset'} value={'资产模块'}>
              资产模块
            </Option>
            <Option key={'device'} value={'设备模块'}>
              设备模块
            </Option>
            <Option key={'network'} value={'网络模块'}>
              网络模块
            </Option>
            <Option key={'user'} value={'用户模块'}>
              用户模块
            </Option>
            <Option key={'alarm'} value={'报警模块'}>
              报警模块
            </Option>
            <Option key={'data'} value={'data'}>
              数据模块
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
