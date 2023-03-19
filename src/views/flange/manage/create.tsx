import { Checkbox, Form, Input, Modal, ModalProps, Select } from 'antd';
import React from 'react';
import { ROOT_ASSETS } from '../../../config/assetCategory.config';
import { SAMPLE_OFFSET, SAMPLE_PERIOD_2 } from '../../../constants';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { addAsset, Asset, AssetRow, getAssets } from '../../asset';
import { PLEASE_SELECT_WIND_TURBINE, WIND_TURBINE } from '../../asset/wind-turbine';
import {
  CREATE_FLANGE,
  FLANGE_ASSET_TYPE_ID,
  FLANGE_NAME,
  FLANGE_TYPE,
  FLANGE_TYPES,
  PLEASE_INPUT_FLANGE_NAME,
  PLEASE_SELECT_FLANGE_TYPE
} from '../types';
import { AttributeFormItem } from './attributeFormItem';

export const FlangeCreate: React.FC<
  ModalProps & {
    onSuccess: () => void;
    windTurbineId?: number;
  }
> = (props) => {
  const [windTurbines, setWindTurbines] = React.useState<AssetRow[]>([]);
  const { windTurbineId, onSuccess } = props;
  const [form] = Form.useForm<Asset>();
  const [isFlangePreload, setIsFlangePreload] = React.useState(false);

  React.useEffect(() => {
    if (windTurbineId === undefined) {
      getAssets({ type: ROOT_ASSETS.get('windTurbine') }).then(setWindTurbines);
    }
  }, [windTurbineId]);

  return (
    <Modal
      {...{
        title: CREATE_FLANGE,
        cancelText: '取消',
        okText: '添加',
        bodyStyle: { overflow: 'auto', maxHeight: 610 },
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            console.log(values);
            const _values = {
              ...values,
              attributes: {
                ...values.attributes,
                monitoring_points_num: Number(values.attributes?.monitoring_points_num),
                sub_type: Number(values.attributes?.sub_type),
                initial_preload: Number(values.attributes?.initial_preload),
                initial_pressure: Number(values.attributes?.initial_pressure)
              }
            };
            try {
              addAsset(_values as any).then(() => {
                onSuccess();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 5 }} validateMessages={defaultValidateMessages}>
        <Form.Item label={FLANGE_NAME} name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={PLEASE_INPUT_FLANGE_NAME} />
        </Form.Item>
        <Form.Item name='type' hidden={true} initialValue={FLANGE_ASSET_TYPE_ID}></Form.Item>
        {windTurbines.length > 0 && windTurbineId === undefined ? (
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
        ) : (
          <Form.Item name='parent_id' hidden={true} initialValue={windTurbineId}></Form.Item>
        )}
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
          wrapperCol={{ offset: 4 }}
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
      </Form>
    </Modal>
  );
};
