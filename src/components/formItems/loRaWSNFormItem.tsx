import { Form, InputNumber } from 'antd';
import { FC } from 'react';
import CommunicationPeriodSelect from '../communicationPeriodSelect';
import { Rules } from '../../constants/validator';
import { COMMUNICATION_PERIOD_2, SECOND_COMMUNICATION_PERIOD } from '../../constants';
import intl from 'react-intl-universal';
import { Term } from '../term';

const LoRaWSNFormItem: FC = () => {
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
    </>
  );
};

export default LoRaWSNFormItem;
