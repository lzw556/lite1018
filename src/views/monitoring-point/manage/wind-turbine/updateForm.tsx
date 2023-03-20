import { Form, Input, InputNumber, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import DeviceSelect from '../../../../components/select/deviceSelect';
import { defaultValidateMessages, Rules } from '../../../../constants/validator';
import { DeviceType } from '../../../../types/device_type';
import { AssetRow, getAssets } from '../../../asset';
import { MONITORING_POINTS, WIND_TURBINE_ASSET_TYPE_ID } from '../../../asset/wind-turbine';
import { FLANGE, getFlanges, PLEASE_SELECT_FLANGE } from '../../../flange';
import {
  MonitoringPoint,
  MonitoringPointRow,
  MONITORING_POINT_NAME,
  MONITORING_POINT_POSITION,
  MONITORING_POINT_TYPE,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING,
  PLEASE_INPUT_MONITORING_POINT_NAME,
  PLEASE_INPUT_MONITORING_POINT_POSITION,
  PLEASE_SELECT_MONITORING_POINT_TYPE
} from '../../types';
import { convertRow } from '../../utils';

export const UpdateForm = ({
  monitoringPoint,
  form,
  children,
  style
}: {
  monitoringPoint: MonitoringPointRow;
  form: FormInstance<MonitoringPoint & { device_id: number }>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  const [flanges, setFlanges] = React.useState<AssetRow[]>([]);
  const [deviceTypeId, setDeviceTypeId] = React.useState<number | undefined>(
    monitoringPoint?.bindingDevices && monitoringPoint?.bindingDevices.length > 0
      ? monitoringPoint?.bindingDevices[0].typeId
      : undefined
  );

  React.useEffect(() => {
    getAssets({ type: WIND_TURBINE_ASSET_TYPE_ID }).then((assets) =>
      setFlanges(getFlanges(assets))
    );
  }, []);

  React.useEffect(() => {
    if (monitoringPoint) {
      form.resetFields();
      const values = convertRow(monitoringPoint);
      if (values) form.setFieldsValue(values);
    }
  }, [monitoringPoint, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 6 }}
      validateMessages={defaultValidateMessages}
      style={style}
    >
      <Form.Item label={MONITORING_POINT_NAME} name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={PLEASE_INPUT_MONITORING_POINT_NAME} />
      </Form.Item>
      <Form.Item
        label={MONITORING_POINT_TYPE}
        name='type'
        rules={[{ required: true, message: PLEASE_SELECT_MONITORING_POINT_TYPE }]}
      >
        <Select placeholder={PLEASE_SELECT_MONITORING_POINT_TYPE} disabled={true}>
          {MONITORING_POINTS.map(({ id, label }) => (
            <Select.Option key={id} value={id}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label='传感器'
        name='device_id'
        rules={[{ required: true, message: `请选择传感器` }]}
      >
        <DeviceSelect
          filters={{
            types: MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING.get(
              monitoringPoint.type
            )?.join(',')
          }}
          onTypeChange={(type) => setDeviceTypeId(type)}
        />
      </Form.Item>
      {deviceTypeId === DeviceType.BoltElongationMultiChannels && (
        <Form.Item
          label='通道号'
          name='channel'
          rules={[{ required: true, message: `请选择通道号` }]}
          initialValue={1}
        >
          <Select>
            {[
              { label: '1', value: 1 },
              { label: '2', value: 2 },
              { label: '3', value: 3 },
              { label: '4', value: 4 }
            ].map(({ label, value }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        label={FLANGE}
        name='asset_id'
        rules={[
          {
            required: true,
            message: PLEASE_SELECT_FLANGE
          }
        ]}
      >
        <Select placeholder={PLEASE_SELECT_FLANGE}>
          {flanges.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={MONITORING_POINT_POSITION}
        name={['attributes', 'index']}
        initialValue={1}
        rules={[{ required: true }, { type: 'integer', min: 1, message: '请填写整数(不能小于1)' }]}
      >
        <InputNumber
          placeholder={PLEASE_INPUT_MONITORING_POINT_POSITION}
          controls={false}
          style={{ width: '100%' }}
        />
      </Form.Item>
      {children}
    </Form>
  );
};
