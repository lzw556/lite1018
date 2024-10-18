import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';
import { AssetCategory, AssetRow } from '../asset-common';
import { SettingFormItems } from './settingFormItems';
import { TypeFormItem } from './typeFormItem';
import { useParents } from './utils';

export const UpdateFormItems = ({ asset, types }: { asset: AssetRow; types: AssetCategory[] }) => {
  const { type } = asset;
  const label = intl.get('ASSET');
  const parents = useParents();

  return (
    <>
      <fieldset>
        <legend>{intl.get('BASIC_INFORMATION')}</legend>
        <FormInputItem
          label={intl.get('NAME')}
          name='name'
          requiredMessage={intl.get('PLEASE_ENTER_NAME')}
          lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
        >
          <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
        </FormInputItem>
        <Form.Item
          label={label}
          name='parent_id'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: label })
            }
          ]}
        >
          <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: label })}>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <TypeFormItem disabled={true} types={types} />
      </fieldset>
      {type && <SettingFormItems key={type} type={type} />}
    </>
  );
};
