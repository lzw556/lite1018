import { Form, InputNumber, Select } from 'antd';
import { FC } from 'react';
import CommunicationPeriodSelect from '../../components/communicationPeriodSelect';
import GroupSizeSelect from '../../components/groupSizeSelect';
import { Rules } from '../../constants/validator';
import { NetworkProvisioningMode } from '../../types/network';
import {
  COMMUNICATION_PERIOD,
  COMMUNICATION_PERIOD_2,
  SECOND_COMMUNICATION_PERIOD
} from '../../constants';

export interface NetworkFormItemProps {
  mode: NetworkProvisioningMode;
  onModeChange?: (mode: NetworkProvisioningMode) => void;
}

const WsnFormItem: FC<NetworkFormItemProps> = ({ mode, onModeChange }) => {
  const render = () => {
    if (mode === NetworkProvisioningMode.Mode2) {
      return (
        <>
          <Form.Item
            label={'主要通讯周期'}
            name={['wsn', 'communication_period']}
            rules={[Rules.required]}
          >
            <CommunicationPeriodSelect
              periods={COMMUNICATION_PERIOD_2}
              placeholder={'请选择主要通讯周期'}
            />
          </Form.Item>
          <Form.Item
            label={'次要通讯周期'}
            name={['wsn', 'communication_period_2']}
            rules={[Rules.required]}
          >
            <CommunicationPeriodSelect
              periods={SECOND_COMMUNICATION_PERIOD}
              placeholder={'请选择次要通讯周期'}
            />
          </Form.Item>
        </>
      );
    }
    return (
      <Form.Item label={'通讯周期'} name={['wsn', 'communication_period']} rules={[Rules.required]}>
        <CommunicationPeriodSelect periods={COMMUNICATION_PERIOD} placeholder={'请选择通讯周期'} />
      </Form.Item>
    );
  };

  return (
    <div>
      <Form.Item label={'组网模式'} name={'mode'} rules={[Rules.required]}>
        <Select placeholder={'请选择组网模式'} onChange={(value) => onModeChange?.(value)}>
          <Select.Option key={1} value={NetworkProvisioningMode.Mode1}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode1)}
          </Select.Option>
          <Select.Option key={2} value={NetworkProvisioningMode.Mode2}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode2)}
          </Select.Option>
        </Select>
      </Form.Item>
      {render()}
      <Form.Item
        label={'通讯延迟'}
        name={['wsn', 'communication_offset']}
        rules={[
          { required: true },
          { type: 'integer', min: 0, message: '请填写整数(不能小于0)' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const wsn = getFieldValue('wsn');
              if (!value || Number(wsn.communication_period) >= value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('通讯延迟不能超过通讯周期'));
            }
          })
        ]}
        dependencies={[['wsn', 'communication_period']]}
      >
        <InputNumber
          placeholder={'请输入通讯延迟'}
          controls={false}
          addonAfter='毫秒'
          style={{ width: '100%' }}
        />
      </Form.Item>
      {mode === NetworkProvisioningMode.Mode1 && (
        <Form.Item label={'每组设备数'} name={['wsn', 'group_size']} rules={[Rules.required]}>
          <GroupSizeSelect placeholder={'请选择网络每组设备数'} />
        </Form.Item>
      )}
    </div>
  );
};

export default WsnFormItem;
