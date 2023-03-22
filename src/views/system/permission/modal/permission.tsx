import { Form, Input, Modal, ModalProps, Select } from 'antd';
import { FC } from 'react';
import { Rules } from '../../../../constants/validator';
import intl from 'react-intl-universal';

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
          label={intl.get('PERMISSION_PATH')}
          rules={[{ required: true, message: intl.get('PLEASE_SELECT_PERMISSION_PATH') }]}
        >
          <Input placeholder={intl.get('PLEASE_SELECT_PERMISSION_PATH')} />
        </Form.Item>
        <Form.Item name={'method'} label={intl.get('REQUEST_METHOD')} rules={[Rules.required]}>
          <Select placeholder={intl.get('PLEASE_SELECT_REQUEST_METHOD')}>
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
        <Form.Item name={'description'} label={intl.get('PERMISSION_DESCRIPTION')}>
          <Input placeholder={intl.get('PLEASE_INPUT_PERMISION_DESCRIPTION')} />
        </Form.Item>
        <Form.Item name={'group'} label={intl.get('GROUP')} rules={[Rules.required]}>
          <Select placeholder={intl.get('PLEASE_SELECT_GROUP')}>
            <Option key={'asset'} value={intl.get('ASSET_MODULE')}>
              {intl.get('ASSET_MODULE')}
            </Option>
            <Option key={'device'} value={intl.get('DEVICE_MODULE')}>
              {intl.get('DEVICE_MODULE')}
            </Option>
            <Option key={'network'} value={intl.get('NETWORK_MODULE')}>
              {intl.get('NETWORK_MODULE')}
            </Option>
            <Option key={'user'} value={intl.get('USER_MODULE')}>
              {intl.get('USER_MODULE')}
            </Option>
            <Option key={'alarm'} value={intl.get('ALARM_MODULE')}>
              {intl.get('ALARM_MODULE')}
            </Option>
            <Option key={'data'} value={intl.get('DATA_MODULE')}>
              {intl.get('DATA_MODULE')}
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionModal;
