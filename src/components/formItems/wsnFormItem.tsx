import { Form, InputNumber, Select, Typography } from 'antd';
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
import intl from 'react-intl-universal';

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
            label={
              <Typography.Text ellipsis={true} title={intl.get('MAJOR_COMMUNICATION_PERIOD')}>
                {intl.get('MAJOR_COMMUNICATION_PERIOD')}
              </Typography.Text>
            }
            name={['wsn', 'communication_period']}
            rules={[Rules.required]}
          >
            <CommunicationPeriodSelect
              periods={COMMUNICATION_PERIOD_2}
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                something: intl.get('MAJOR_COMMUNICATION_PERIOD')
              })}
            />
          </Form.Item>
          <Form.Item
            label={
              <Typography.Text ellipsis={true} title={intl.get('SECONDARY_COMMUNICATION_PERIOD')}>
                {intl.get('SECONDARY_COMMUNICATION_PERIOD')}
              </Typography.Text>
            }
            name={['wsn', 'communication_period_2']}
            rules={[Rules.required]}
          >
            <CommunicationPeriodSelect
              periods={SECOND_COMMUNICATION_PERIOD}
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                something: intl.get('SECONDARY_COMMUNICATION_PERIOD')
              })}
            />
          </Form.Item>
        </>
      );
    }
    return (
      <Form.Item
        label={
          <Typography.Text ellipsis={true} title={intl.get('COMMUNICATION_PERIOD')}>
            {intl.get('COMMUNICATION_PERIOD')}
          </Typography.Text>
        }
        name={['wsn', 'communication_period']}
        rules={[Rules.required]}
      >
        <CommunicationPeriodSelect
          periods={COMMUNICATION_PERIOD}
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
            something: intl.get('COMMUNICATION_PERIOD')
          })}
        />
      </Form.Item>
    );
  };

  return (
    <div>
      <Form.Item
        label={
          <Typography.Text ellipsis={true} title={intl.get('WSN_MODE')}>
            {intl.get('WSN_MODE')}
          </Typography.Text>
        }
        name={'mode'}
        rules={[Rules.required]}
      >
        <Select
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
            something: intl.get('WSN_MODE')
          })}
          onChange={(value) => onModeChange?.(value)}
        >
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
        label={
          <Typography.Text ellipsis={true} title={intl.get('COMMUNICATION_OFFSET')}>
            {intl.get('COMMUNICATION_OFFSET')}
          </Typography.Text>
        }
        name={['wsn', 'communication_offset']}
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('SETTING_COMMUNICATION_PERIOD')
            })
          },
          { type: 'integer', min: 0, message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const wsn = getFieldValue('wsn');
              if (!value || Number(wsn.communication_period) >= value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(intl.get('COMMUNICATION_OFFSET_PROMPT')));
            }
          })
        ]}
        dependencies={[['wsn', 'communication_period']]}
      >
        <InputNumber
          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('COMMUNICATION_OFFSET')
          })}
          controls={false}
          addonAfter={intl.get('UNIT_MILLISECOND')}
          style={{ width: '100%' }}
        />
      </Form.Item>
      {mode === NetworkProvisioningMode.Mode1 && (
        <Form.Item
          label={intl.get('GROUP_SIZE')}
          name={['wsn', 'group_size']}
          rules={[Rules.required]}
        >
          <GroupSizeSelect
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('GROUP_SIZE') })}
          />
        </Form.Item>
      )}
    </div>
  );
};

export default WsnFormItem;
