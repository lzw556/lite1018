import { Form, Select } from 'antd';
import { FC, useEffect, useState } from 'react';
import CommunicationPeriodSelect from '../../components/communicationPeriodSelect';
import CommunicationTimeOffsetSelect from '../../components/communicationTimeOffsetSelect';
import GroupSizeSelect from '../../components/groupSizeSelect';
import { Rules } from '../../constants/validator';
import { NetworkProvisioningMode } from '../../types/network';
import {
  COMMUNICATION_OFFSET,
  COMMUNICATION_OFFSET_2,
  COMMUNICATION_PERIOD,
  COMMUNICATION_PERIOD_2,
  SECOND_COMMUNICATION_PERIOD
} from '../../constants';

export interface NetworkFormItemProps {
  mode: NetworkProvisioningMode;
}

const WsnFormItem: FC<NetworkFormItemProps> = ({ mode }) => {
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
              placeholder={'请选择网络主要通讯周期'}
            />
          </Form.Item>
          <Form.Item
            label={'次要通讯周期'}
            name={['wsn', 'communication_period_2']}
            rules={[Rules.required]}
          >
            <CommunicationPeriodSelect
              periods={SECOND_COMMUNICATION_PERIOD}
              placeholder={'请选择网络次要通讯周期'}
            />
          </Form.Item>
        </>
      );
    }
    return (
      <Form.Item label={'通讯周期'} name={['wsn', 'communication_period']} rules={[Rules.required]}>
        <CommunicationPeriodSelect
          periods={COMMUNICATION_PERIOD}
          placeholder={'请选择网络通讯周期'}
        />
      </Form.Item>
    );
  };

  return (
    <div>
      {render()}
      <Form.Item label={'通讯延时'} name={['wsn', 'communication_offset']} rules={[Rules.required]}>
        <CommunicationTimeOffsetSelect
          offsets={mode === 1 ? COMMUNICATION_OFFSET : COMMUNICATION_OFFSET_2}
          placeholder={'请选择网络通讯延时'}
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
