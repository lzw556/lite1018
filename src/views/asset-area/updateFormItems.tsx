import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../components/formInputItem';
import { AssetRow, useContext } from '../asset-common';
import { area, isAssetAreaParent } from '../asset-variant';

export const UpdateFormItems = ({ asset }: { asset: AssetRow }) => {
  const { label } = area;
  const { assets } = useContext();
  const parents = assets.filter(isAssetAreaParent);

  return (
    <>
      <FormInputItem
        label={intl.get('NAME')}
        name='name'
        requiredMessage={intl.get('PLEASE_ENTER_NAME')}
        lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
      >
        <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
      </FormInputItem>
      {asset.parentId > 0 && (
        <Form.Item label={intl.get(label)} name='parent_id'>
          <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
};
