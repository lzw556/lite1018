import React from 'react';
import { Col, InputNumber, Row } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import { getDisplayName } from '../../../utils/format';
import { useLocaleContext } from '../../../localeProvider';
import { MonitoringPointRow } from '../../asset-common';
import { AttributeFormItem } from './attributeFormItem';

type FieldProps = {
  monitoringPoint?: MonitoringPointRow;
  mode: 'create' | 'update';
  nameIndex?: number;
  restFields?: {
    fieldKey?: number | undefined;
  };
};

export const Others = (props: FieldProps) => {
  const { monitoringPoint, ...rest } = props;
  const initialThickness = (
    <AttributeFormItem
      label={intl.get('INITIAL_THICKNESS')}
      name='initial_thickness'
      {...rest}
      enabled={!!monitoringPoint?.attributes?.initial_thickness}
    />
  );
  const criticalThickness = (
    <AttributeFormItem
      label={intl.get('CRITICAL_THICKNESS')}
      name='critical_thickness'
      {...rest}
      enabled={!!monitoringPoint?.attributes?.critical_thickness}
    />
  );

  if (rest.mode === 'create') {
    return (
      <Row>
        <Col span={24}>{initialThickness}</Col>
        <Col span={24}>{criticalThickness}</Col>
        <Col span={12}>
          <ShortTerm {...rest} />
        </Col>
        <Col span={12}>
          <LongTerm {...rest} />
        </Col>
      </Row>
    );
  } else {
    return (
      <>
        {initialThickness}
        {criticalThickness}
        <ShortTerm {...rest} />
        <LongTerm {...rest} />
      </>
    );
  }
};

function ShortTerm(props: FieldProps) {
  const { mode, nameIndex, restFields } = props;
  const { language } = useLocaleContext();
  const commonNameProp = ['attributes', 'corrosion_rate_short_term'];
  const nameProp = nameIndex !== undefined ? [nameIndex, ...commonNameProp] : commonNameProp;
  const isModeCreate = mode === 'create';

  return (
    <FormInputItem
      {...restFields}
      initialValue={30}
      label={
        isModeCreate
          ? getDisplayName({
              name: intl.get('CORROSION_RATE_SHORT_TERM'),
              suffix: intl.get('UNIT_DAY'),
              lang: language
            })
          : intl.get('CORROSION_RATE_SHORT_TERM')
      }
      name={nameProp}
      numericChildren={
        <InputNumber
          addonAfter={isModeCreate ? undefined : intl.get('UNIT_DAY')}
          controls={false}
          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_SHORT_TERM')
          })}
          style={{ width: '100%' }}
        />
      }
      numericRule={{
        isInteger: true,
        min: 1,
        message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
      }}
      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
        something: intl.get('CORROSION_RATE_SHORT_TERM')
      })}
      style={isModeCreate ? { display: 'inline-block', width: 200, marginRight: 20 } : undefined}
    />
  );
}

function LongTerm(props: FieldProps) {
  const { mode, nameIndex, restFields } = props;
  const { language } = useLocaleContext();
  const commonNameProp = ['attributes', 'corrosion_rate_long_term'];
  const nameProp = nameIndex !== undefined ? [`${nameIndex}`, ...commonNameProp] : commonNameProp;
  const isModeCreate = mode === 'create';
  return (
    <FormInputItem
      {...restFields}
      initialValue={365}
      label={
        isModeCreate
          ? getDisplayName({
              name: intl.get('CORROSION_RATE_LONG_TERM'),
              suffix: intl.get('UNIT_DAY'),
              lang: language
            })
          : intl.get('CORROSION_RATE_LONG_TERM')
      }
      name={nameProp}
      numericChildren={
        <InputNumber
          addonAfter={isModeCreate ? undefined : intl.get('UNIT_DAY')}
          controls={false}
          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('CORROSION_RATE_LONG_TERM')
          })}
          style={{ width: '100%' }}
        />
      }
      numericRule={{
        isInteger: true,
        min: 1,
        message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
      }}
      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
        something: intl.get('CORROSION_RATE_LONG_TERM')
      })}
      style={isModeCreate ? { display: 'inline-block', width: 200, marginRight: 20 } : undefined}
    />
  );
}
