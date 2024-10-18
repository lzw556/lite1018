import React from 'react';
import { Form, InputNumber, Select } from 'antd';
import intl from 'react-intl-universal';
import { NetworkProvisioningMode } from '../../../types/network';
import { Term } from '../../../components/term';
import CommunicationPeriodSelect from '../../../components/communicationPeriodSelect';
import { Rules } from '../../../constants/validator';
import {
  COMMUNICATION_PERIOD,
  COMMUNICATION_PERIOD_2,
  SECOND_COMMUNICATION_PERIOD
} from '../../../constants';
import GroupSizeSelect from '../../../components/groupSizeSelect';

export const WsnFormItem = () => {
  const [mode, setMode] = React.useState<NetworkProvisioningMode>(NetworkProvisioningMode.Mode2);

  const render = () => {
    if (mode === NetworkProvisioningMode.Mode2) {
      return (
        <>
          <Form.Item
            label={
              <Term
                name={intl.get('MAJOR_COMMUNICATION_PERIOD')}
                description={intl.get('MAJOR_COMMUNICATION_PERIOD_DESC')}
              />
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
              <Term
                name={intl.get('SECONDARY_COMMUNICATION_PERIOD')}
                description={intl.get('SECONDARY_COMMUNICATION_PERIOD_DESC')}
              />
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
          <Form.Item
            label={
              <Term name={intl.get('INTERVAL_CNT')} description={intl.get('INTERVAL_CNT_DESC')} />
            }
            name={['wsn', 'interval_cnt']}
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('INTERVAL_CNT')
                })
              }
            ]}
          >
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('INTERVAL_CNT')
              })}
              controls={false}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </>
      );
    }
    return (
      <Form.Item
        label={
          <Term
            name={intl.get('COMMUNICATION_PERIOD')}
            description={intl.get('COMMUNICATION_PERIOD_DESC')}
          />
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
    <>
      <Form.Item
        label={<Term name={intl.get('WSN_MODE')} description={intl.get('WSN_MODE_DESC')} />}
        name={'mode'}
        rules={[Rules.required]}
      >
        <Select
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
            something: intl.get('WSN_MODE')
          })}
          onChange={setMode}
        >
          <Select.Option key={1} value={NetworkProvisioningMode.Mode1}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode1)}
          </Select.Option>
          <Select.Option key={2} value={NetworkProvisioningMode.Mode2}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode2)}
          </Select.Option>
          <Select.Option key={3} value={NetworkProvisioningMode.Mode3}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode3)}
          </Select.Option>
          <Select.Option key={4} value={NetworkProvisioningMode.Mode4}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode4)}
          </Select.Option>
          <Select.Option key={5} value={NetworkProvisioningMode.Mode5}>
            {NetworkProvisioningMode.toString(NetworkProvisioningMode.Mode5)}
          </Select.Option>
        </Select>
      </Form.Item>
      {render()}
      <Form.Item
        label={
          <Term
            name={intl.get('COMMUNICATION_OFFSET')}
            description={intl.get('COMMUNICATION_OFFSET_DESC')}
          />
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
          label={<Term name={intl.get('GROUP_SIZE')} description={intl.get('GROUP_SIZE_DESC')} />}
          name={['wsn', 'group_size']}
          rules={[Rules.required]}
        >
          <GroupSizeSelect
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('GROUP_SIZE') })}
          />
        </Form.Item>
      )}
      {mode === NetworkProvisioningMode.Mode2 && (
        <Form.Item
          label={
            <Term name={intl.get('GROUP_SIZE_2')} description={intl.get('GROUP_SIZE_2_DESC')} />
          }
          name={['wsn', 'group_size_2']}
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('GROUP_SIZE_2')
              })
            }
          ]}
        >
          <InputNumber
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('GROUP_SIZE_2')
            })}
            controls={false}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}
    </>
  );
};
