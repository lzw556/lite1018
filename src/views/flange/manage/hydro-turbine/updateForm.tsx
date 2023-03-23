import { Checkbox, Form, FormInstance, Input, InputNumber, Select } from 'antd';
import React from 'react';
import { checkIsFlangePreload } from '../..';
import { FormInputItem } from '../../../../components/formInputItem';
import { SAMPLING_OFFSET, SAMPLING_PERIOD_2 } from '../../../../constants';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { Asset, AssetRow, getAssets, useAssetCategoryContext } from '../../../asset';
import {
  convertRow,
  getHydros,
  PLEASE_SELECT_HYDRO_TURBINE,
  HYDRO_TURBINE,
  HYDRO_TURBINE_ASSET_TYPE_ID
} from '../../../asset/hydro-turbine';
import {
  FLANGE_ASSET_TYPE_ID,
  FLANGE_NAME,
  FLANGE_TYPE,
  FLANGE_TYPES,
  PLEASE_INPUT_FLANGE_NAME,
  PLEASE_SELECT_FLANGE_TYPE
} from '../../types';
import { AttributeFormItem } from '../attributeFormItem';
import intl from 'react-intl-universal';

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
  const category = useAssetCategoryContext();
  const [windTurbines, setWindTurbines] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(flange));

  React.useEffect(() => {
    getAssets({ type: HYDRO_TURBINE_ASSET_TYPE_ID }).then((assets) =>
      setWindTurbines(getHydros(assets))
    );
  }, [category]);

  React.useEffect(() => {
    if (flange) {
      form.resetFields();
      const values = convertRow(flange);
      if (values) form.setFieldsValue(values);
    }
  }, [flange, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={intl.get(FLANGE_NAME)} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={intl.get(PLEASE_INPUT_FLANGE_NAME)} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={FLANGE_ASSET_TYPE_ID}></Form.Item>
      <Form.Item
        label={intl.get(HYDRO_TURBINE)}
        name='parent_id'
        rules={[{ required: true, message: intl.get(PLEASE_SELECT_HYDRO_TURBINE) }]}
      >
        <Select placeholder={intl.get(PLEASE_SELECT_HYDRO_TURBINE)}>
          {windTurbines.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={intl.get(FLANGE_TYPE)}
        name={['attributes', 'type']}
        rules={[{ required: true, message: intl.get(PLEASE_SELECT_FLANGE_TYPE) }]}
      >
        <Select placeholder={intl.get(PLEASE_SELECT_FLANGE_TYPE)}>
          {FLANGE_TYPES.map(({ value, label }) => (
            <Select.Option key={value} value={value}>
              {intl.get(label)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={intl.get('INDEX_NUMBER')} name={['attributes', 'index']} initialValue={1}>
        <Select placeholder={intl.get('PLEASE_SELECT_INDEX_NUMBER')}>
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
            numericRule={{ isInteger: false }}
            numericChildren={
              <InputNumber
                controls={false}
                style={{ width: '100%' }}
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('NUMBER_OF_BOLT')
                })}
              />
            }
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
                  {item.text}
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
                  {item.text}
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
            numericRule={{ isInteger: false }}
            numericChildren={
              <InputNumber
                controls={false}
                style={{ width: '100%' }}
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('INITIAL_PRELOAD')
                })}
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
            numericRule={{ isInteger: false }}
            numericChildren={
              <InputNumber
                controls={false}
                style={{ width: '100%' }}
                placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
                  something: intl.get('INITIAL_PRESSURE')
                })}
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
