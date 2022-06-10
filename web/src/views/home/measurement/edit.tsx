import { Form, Input, Modal, ModalProps, Select } from 'antd';
import * as React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { defaultValidateMessages, Rules } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { AssetTypes, MeasurementTypes } from '../constants';
import { AssetRow } from '../asset/props';
import { getAssets } from '../asset/services';
import { convertRow, Measurement, MeasurementRow } from './props';
import { addMeasurement, bindDevice, unbindDevice, updateMeasurement } from './services';

export const MeasurementEdit: React.FC<
  ModalProps & { selectedRow?: MeasurementRow } & { onSuccess: () => void }
> = (props) => {
  const [types, setTypes] = React.useState([DeviceType.BoltLoosening, DeviceType.BoltElongation]);
  const { selectedRow, onSuccess } = props;
  const { id, bindingDevices } = selectedRow || {};
  const [form] = Form.useForm<Measurement & { device_id: number }>();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [disabled, setDisabled] = React.useState(true);

  React.useEffect(() => {
    getAssets({ type: AssetTypes.Flange.id }).then((assets) => {
      const local = localStorage.getItem('measurementListFilters');
      const filters: { windTurbineId: number } = local ? JSON.parse(local) : null;
      setParents(
        assets.filter((asset) => (filters ? filters.windTurbineId === asset.parentId : true))
      );
    });
  }, []);

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(selectedRow);
    if (values) {
      form.setFieldsValue(values);
    }
  }, [form, selectedRow]);

  return (
    <Modal
      {...{
        title: id ? `监测点编辑` : `监测点添加`,
        cancelText: '取消',
        okText: id ? '更新' : '添加',
        ...props,
        onOk: () => {
          form.validateFields().then((values) => {
            const { id } = values;
            try {
              if (!id) {
                addMeasurement(values).then((measurement) => {
                  bindDevice(measurement.id, values.device_id);
                  onSuccess();
                });
              } else {
                if (
                  bindingDevices &&
                  bindingDevices.length > 0 &&
                  bindingDevices[0].id !== values.device_id
                ) {
                  unbindDevice(id, bindingDevices[0].id);
                  bindDevice(id, values.device_id);
                } else if (!bindingDevices || bindingDevices.length === 0) {
                  bindDevice(id, values.device_id);
                }
                updateMeasurement(id, values).then(() => {
                  onSuccess();
                });
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }}
    >
      <Form form={form} labelCol={{ span: 4 }} validateMessages={defaultValidateMessages}>
        {id && (
          <Form.Item label='id' name='id' hidden={true}>
            <Input />
          </Form.Item>
        )}
        <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
          <Input placeholder={`请填写监测点名称`} />
        </Form.Item>
        <Form.Item label='类型' name='type' rules={[{ required: true, message: `请选择类型` }]}>
          <Select
            placeholder='请选择类型'
            onChange={(e) => {
              if (!id) {
                const type = Object.values(MeasurementTypes).find((type) => type.id === e);
                if (type) {
                  setTypes([type.deviceType]);
                  if (form.getFieldValue('device_id')) {
                    form.setFieldsValue({ device_id: undefined });
                  }
                }
                setDisabled(false);
              }
            }}
            disabled={!!id}
          >
            {Object.values(MeasurementTypes).map(({ id, label }) => (
              <Select.Option key={id} value={id}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* TODO */}
        {/* <Form.Item label='法兰' name='asset_id' rules={[{ required: true, message: `请选择法兰` }]}>
          <Cascader options={parents} fieldNames={{ label: 'name', value: 'id' }} />
        </Form.Item> */}
        <Form.Item
          label='传感器'
          name='device_id'
          rules={[{ required: true, message: `请选择传感器` }]}
        >
          <DeviceSelect filters={{ types: types.join(',') }} disabled={disabled && !id} />
        </Form.Item>
        <Form.Item label='法兰' name='asset_id' rules={[{ required: true, message: `请选择法兰` }]}>
          <Select placeholder='请选择法兰'>
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label='序号' name={['attributes', 'index']} initialValue={1}>
          <Select placeholder='请选择序号'>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
