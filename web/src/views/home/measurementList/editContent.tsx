import { Form, Input, Select } from 'antd';
import * as React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { Rules } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import { AssetTypes, MeasurementTypes } from '../common/constants';
import { convertRow, MeasurementRow } from '../summary/measurement/props';

export const EditContent: React.FC<
  { selectedRow?: MeasurementRow } & { onSuccess: () => void } & { assetId?: number } & {
    form: any;
  } & { flangeId?: number }
> = (props) => {
  const [types, setTypes] = React.useState([DeviceType.BoltLoosening, DeviceType.BoltElongation]);
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const { selectedRow, form } = props;
  const { id } = selectedRow || {};

  React.useEffect(() => {
    getAssets({ type: AssetTypes.Flange.id }).then((assets) => {
      setParents(
        assets.filter((asset) => (props.assetId ? props.assetId === asset.parentId : true))
      );
    });
  }, [props.assetId]);

  React.useEffect(() => {
    form.resetFields();
    const values = convertRow(selectedRow);
    if (values) {
      const type = Object.values(MeasurementTypes).find((type) => type.id === values.type);
      if (type) setTypes([type.deviceType]);
      form.setFieldsValue(values);
    }
  }, [form, selectedRow]);

  return (
    <>
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
      <Form.Item
        label='法兰'
        name='asset_id'
        rules={[{ required: true, message: `请选择法兰` }]}
        hidden={!!props.flangeId && !id}
        initialValue={props.flangeId}
      >
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
    </>
  );
};
