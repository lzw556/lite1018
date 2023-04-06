import { Checkbox, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import React from 'react';
import { checkIsFlangePreload } from '../';
import { FormInputItem } from '../../../components/formInputItem';
import { SAMPLING_OFFSET, SAMPLING_PERIOD_2 } from '../../../constants';
import { Asset, AssetCategoryKey, AssetRow, getAssets } from '../../asset';
import { FLANGE_TYPES } from '../types';
import { AttributeFormItem } from './attributeFormItem';
import intl from 'react-intl-universal';
import { convertRow } from '../../asset/common/utils';
import { useAssetCategoryChain } from '../../../config/assetCategory.config';

export const UpdateForm = ({
  flange,
  form,
  children,
  style
}: {
  flange: AssetRow;
  form: FormInstance<Asset>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  const {
    root: { key, label }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(flange));

  React.useEffect(() => {
    getAssets({ type: key, parent_id: 0 }).then(setParents);
  }, [key, flange.id]);

  React.useEffect(() => {
    if (flange) {
      form.resetFields();
      const values = convertRow(flange);
      if (values) form.setFieldsValue(values);
    }
  }, [flange, form]);

  return (
    <Form form={form} labelCol={{ span: 6 }} style={style}>
      <FormInputItem
        label={intl.get('NAME')}
        name='name'
        requiredMessage={intl.get('PLEASE_ENTER_NAME')}
        lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
      >
        <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
      </FormInputItem>
      <Form.Item name='type' hidden={true} initialValue={AssetCategoryKey.FLANGE}>
        <Input />
      </Form.Item>
      <Form.Item
        label={intl.get(label)}
        name='parent_id'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })
          }
        ]}
      >
        <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={intl.get('FLANGE_TYPE')}
        name={['attributes', 'type']}
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('FLANGE_TYPE') })
          }
        ]}
      >
        <Select
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('FLANGE_TYPE') })}
        >
          {FLANGE_TYPES.map(({ value, label }) => (
            <Select.Option key={value} value={value}>
              {intl.get(label)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={intl.get('INDEX_NUMBER')} name={['attributes', 'index']} initialValue={1}>
        <Select>
          {[1, 2, 3, 4, 5].map((item) => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <AttributeFormItem label={intl.get('RATING')} name='normal' />
      <AttributeFormItem label={intl.get('INITIAL_VALUE')} name='initial' />
      <AttributeFormItem label={intl.get('ALARM_LEVEL_MINOR_TITLE')} name='info' />
      <AttributeFormItem label={intl.get('ALARM_LEVEL_MAJOR_TITLE')} name='warn' />
      <AttributeFormItem label={intl.get('ALARM_LEVEL_CRITICAL_TITLE')} name='danger' />
      <Form.Item
        name={['attributes', 'sub_type']}
        valuePropName='checked'
        wrapperCol={{ offset: 6 }}
        initialValue={false}
      >
        <Checkbox onChange={(e) => setIsFlangePreload(e.target.checked)}>
          {intl.get('CALCULATE_FLANGE_PRELOAD')}
        </Checkbox>
      </Form.Item>
      {isFlangePreload && (
        <>
          <FormInputItem
            label={intl.get('NUMBER_OF_BOLT')}
            name={['attributes', 'monitoring_points_num']}
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('NUMBER_OF_BOLT')
            })}
            numericRule={{
              isInteger: true,
              min: 1,
              message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
            }}
            placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('NUMBER_OF_BOLT')
            })}
          />
          <Form.Item
            label={intl.get('SAMPLING_PERIOD')}
            name={['attributes', 'sample_period']}
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('SAMPLING_PERIOD')
                })
              }
            ]}
          >
            <Select
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                something: intl.get('SAMPLING_PERIOD')
              })}
            >
              {SAMPLING_PERIOD_2.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {intl.get(item.text)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={intl.get('SAMPLING_OFFSET')}
            name={['attributes', 'sample_time_offset']}
            rules={[
              {
                required: true,
                message: intl.get('PLEASE_SELECT_SOMETHING', {
                  something: intl.get('SAMPLING_OFFSET')
                })
              }
            ]}
          >
            <Select
              placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
                something: intl.get('SAMPLING_OFFSET')
              })}
            >
              {SAMPLING_OFFSET.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {intl.get(item.text)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormInputItem
            label={intl.get('INITIAL_PRELOAD')}
            name={['attributes', 'initial_preload']}
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('INITIAL_PRELOAD')
            })}
            numericRule={{
              message: intl.get('PLEASE_ENTER_NUMERIC')
            }}
            numericChildren={
              <InputNumber
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('INITIAL_PRELOAD')
                })}
                style={{ width: '100%' }}
                controls={false}
                addonAfter='kN'
              />
            }
          />
          <FormInputItem
            label={intl.get('INITIAL_PRESSURE')}
            name={['attributes', 'initial_pressure']}
            requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
              something: intl.get('INITIAL_PRESSURE')
            })}
            numericRule={{
              message: intl.get('PLEASE_ENTER_NUMERIC')
            }}
            numericChildren={
              <InputNumber
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('INITIAL_PRELOAD')
                })}
                style={{ width: '100%' }}
                controls={false}
                addonAfter='MPa'
              />
            }
          />
        </>
      )}
      {children}
    </Form>
  );
};
