import { Form, Input, Select } from 'antd';
import * as React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { Rules } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import { AssetTypes, MeasurementTypes } from '../common/constants';

export const EditContent: React.FC<{ form: any; asset?: AssetRow; doUpdating?: boolean }> = ({
  asset,
  form,
  doUpdating
}) => {
  const [types, setTypes] = React.useState([DeviceType.BoltLoosening, DeviceType.BoltElongation]);
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const parentId = asset && asset.type === AssetTypes.Flange.id ? asset.id : undefined;
  const grandParentId = asset && asset.type === AssetTypes.WindTurbind.id ? asset.id : undefined;

  React.useEffect(() => {
    getAssets({ type: AssetTypes.Flange.id }).then((assets) => {
      setParents(assets.filter((asset) => (grandParentId ? grandParentId === asset.parentId : true)));
    });
  }, [grandParentId]);

  return (
    <>
      <Form.Item label='名称' name='name' rules={[Rules.range(4, 50)]}>
        <Input placeholder={`请填写监测点名称`} />
      </Form.Item>
      <Form.Item label='类型' name='type' rules={[{ required: true, message: `请选择类型` }]}>
        <Select
          placeholder='请选择类型'
          onChange={(e) => {
            if (!doUpdating) {
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
          disabled={doUpdating}
        >
          {Object.values(MeasurementTypes).map(({ id, label }) => (
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
        <DeviceSelect filters={{ types: types.join(',') }} disabled={disabled && !doUpdating} />
      </Form.Item>
      <Form.Item
        label='法兰'
        name='asset_id'
        rules={[{ required: true, message: `请选择法兰` }]}
        hidden={!doUpdating && !!parentId}
        initialValue={parentId}
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
