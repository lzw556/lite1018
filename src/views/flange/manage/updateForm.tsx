import { Checkbox, Form, FormInstance, Input, Select } from 'antd';
import React from 'react';
import { checkIsFlangePreload } from '..';
import { ROOT_ASSETS } from '../../../config/assetCategory.config';
import { SAMPLE_OFFSET, SAMPLE_PERIOD_2 } from '../../../constants';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { Asset, AssetRow, getAssets } from '../../asset';
import {
  convertRow,
  getWinds,
  PLEASE_SELECT_WIND_TURBINE,
  WIND_TURBINE
} from '../../asset/wind-turbine';
import {
  FLANGE_ASSET_TYPE_ID,
  FLANGE_NAME,
  FLANGE_TYPE,
  FLANGE_TYPES,
  PLEASE_INPUT_FLANGE_NAME,
  PLEASE_SELECT_FLANGE_TYPE
} from '../types';
import { AttributeFormItem } from './attributeFormItem';

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
  const [windTurbines, setWindTurbines] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(flange));

  React.useEffect(() => {
    getAssets({ type: ROOT_ASSETS.get('windTurbine') }).then((assets) =>
      setWindTurbines(getWinds(assets))
    );
  }, []);

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
      labelCol={{ span: 5 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={FLANGE_NAME} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={PLEASE_INPUT_FLANGE_NAME} />
      </Form.Item>
      <Form.Item name='type' hidden={true} initialValue={FLANGE_ASSET_TYPE_ID}></Form.Item>
      <Form.Item
        label={WIND_TURBINE}
        name='parent_id'
        rules={[{ required: true, message: PLEASE_SELECT_WIND_TURBINE }]}
      >
        <Select placeholder={PLEASE_SELECT_WIND_TURBINE}>
          {windTurbines.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={FLANGE_TYPE}
        name={['attributes', 'type']}
        rules={[{ required: true, message: PLEASE_SELECT_FLANGE_TYPE }]}
      >
        <Select placeholder={PLEASE_SELECT_FLANGE_TYPE}>
          {FLANGE_TYPES.map(({ value, label }) => (
            <Select.Option key={value} value={value}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label='序号' name={['attributes', 'index']} initialValue={1}>
        <Select placeholder='请选择序号'>
          {[1, 2, 3, 4, 5].map((item) => (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <AttributeFormItem label='额定值' name='normal' />
      <AttributeFormItem label='初始值' name='initial' />
      <AttributeFormItem label='次要报警' name='info' />
      <AttributeFormItem label='重要报警' name='warn' />
      <AttributeFormItem label='紧急报警' name='danger' />
      <Form.Item
        name={['attributes', 'sub_type']}
        valuePropName='checked'
        wrapperCol={{ offset: 5 }}
        initialValue={false}
      >
        <Checkbox onChange={(e) => setIsFlangePreload(e.target.checked)}>计算法兰预紧力</Checkbox>
      </Form.Item>
      {isFlangePreload && (
        <>
          <Form.Item
            label='螺栓数量'
            name={['attributes', 'monitoring_points_num']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写螺栓数量`} />
          </Form.Item>
          <Form.Item
            label='采集周期'
            name={['attributes', 'sample_period']}
            rules={[{ required: true, message: '请选择采集周期' }]}
          >
            <Select placeholder={'请选择采集周期'}>
              {SAMPLE_PERIOD_2.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='采集延迟'
            name={['attributes', 'sample_time_offset']}
            rules={[{ required: true, message: '请选择采集延迟' }]}
          >
            <Select placeholder={'请选择采集延迟'}>
              {SAMPLE_OFFSET.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.text}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label='初始预紧力'
            name={['attributes', 'initial_preload']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写初始预紧力`} suffix='kN' />
          </Form.Item>
          <Form.Item
            label='初始应力'
            name={['attributes', 'initial_pressure']}
            rules={[Rules.number]}
          >
            <Input placeholder={`请填写初始应力`} suffix='MPa' />
          </Form.Item>
        </>
      )}
      {children}
    </Form>
  );
};
