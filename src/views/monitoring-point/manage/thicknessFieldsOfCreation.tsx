import { Col, InputNumber, Row } from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { ThicknessAttributeFormItem } from './thicknessAttributeFormItem';
import { getDisplayName } from '../../../utils/format';
import { useLocaleContext } from '../../../localeProvider';

export const ThicknessFieldsOfCreation = ({
  name,
  restFields
}: {
  name: number;
  restFields: {
    fieldKey?: number | undefined;
  };
}) => {
  const { language } = useLocaleContext();
  return (
    <Row>
      <Col span={24}>
        <ThicknessAttributeFormItem
          label={intl.get('INITIAL_THICKNESS')}
          itemName={name}
          name='initial_thickness'
        />
      </Col>
      <Col span={24}>
        <ThicknessAttributeFormItem
          label={intl.get('CRITICAL_THICKNESS')}
          itemName={name}
          name='critical_thickness'
        />
      </Col>
      <Col span={12}>
        <FormInputItem
          label={getDisplayName({
            name: intl.get('CORROSION_RATE_SHORT_TERM'),
            suffix: intl.get('UNIT_DAY'),
            lang: language
          })}
          {...restFields}
          name={[name, 'attributes', 'corrosion_rate_short_term']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_SHORT_TERM')
          })}
          initialValue={30}
          numericRule={{
            isInteger: true,
            min: 1,
            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
          }}
          style={{ display: 'inline-block', width: 200, marginRight: 20 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('CORROSION_RATE_SHORT_TERM')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
      </Col>
      <Col span={12}>
        <FormInputItem
          {...restFields}
          label={getDisplayName({
            name: intl.get('CORROSION_RATE_LONG_TERM'),
            suffix: intl.get('UNIT_DAY'),
            lang: language
          })}
          name={[name, 'attributes', 'corrosion_rate_long_term']}
          requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_LONG_TERM')
          })}
          initialValue={365}
          numericRule={{
            isInteger: true,
            min: 1,
            message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
          }}
          style={{ display: 'inline-block', width: 200 }}
          numericChildren={
            <InputNumber
              placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                something: intl.get('CORROSION_RATE_LONG_TERM')
              })}
              style={{ width: '100%' }}
              controls={false}
            />
          }
        />
      </Col>
    </Row>
  );
};
