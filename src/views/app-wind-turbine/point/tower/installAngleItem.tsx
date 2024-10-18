import React from 'react';
import { InputNumber } from 'antd';
import intl from 'react-intl-universal';
import { useLocaleContext } from '../../../../localeProvider';
import { FormInputItem } from '../../../../components/formInputItem';
import { getDisplayName } from '../../../../utils/format';

export const InstallAngletItem = ({
  mode,
  name,
  restFields
}: {
  mode: 'create' | 'update';
  name?: number;
  restFields?: {
    fieldKey?: number | undefined;
  };
}) => {
  const { language } = useLocaleContext();
  const commonNameProp = ['attributes', 'tower_install_angle'];
  const nameProp = name !== undefined ? [name, ...commonNameProp] : commonNameProp;
  const isModeCreate = mode === 'create';
  return (
    <FormInputItem
      label={
        isModeCreate
          ? getDisplayName({
              name: intl.get('TOWER_INSTALL_ANGLE'),
              suffix: '°',
              lang: language
            })
          : intl.get('TOWER_INSTALL_ANGLE')
      }
      {...restFields}
      name={nameProp}
      requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
        something: intl.get('TOWER_INSTALL_ANGLE')
      })}
      numericChildren={
        <InputNumber
          addonAfter={isModeCreate ? undefined : '°'}
          controls={false}
          placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get('TOWER_INSTALL_ANGLE')
          })}
          style={{ width: '100%' }}
        />
      }
      numericRule={{
        message: intl.get('VALIDATOR_NUMBER_RANGE', {
          name: intl.get('TOWER_INSTALL_ANGLE'),
          min: -180,
          max: 180
        }),
        min: -180,
        max: 180
      }}
      style={isModeCreate ? { display: 'inline-block', width: 200, marginRight: 20 } : undefined}
    />
  );
};
