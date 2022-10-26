import { Form, Input, Select } from 'antd';
import * as React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { Rules } from '../../../constants/validator';
import { DeviceType } from '../../../types/device_type';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import * as AppConfig from '../../../config';

export const EditContent: React.FC<{ form: any; asset?: AssetRow; doUpdating?: boolean }> = ({
  asset,
  form,
  doUpdating
}) => {
  const [types, setTypes] = React.useState([DeviceType.BoltLoosening, DeviceType.BoltElongation]);
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const configWind = AppConfig.use('wind');
  const parentId = asset && asset.type !== configWind.assetType.id ? asset.id : undefined;
  const parentLabel =
    AppConfig.use(window.assetCategory).assetType.secondAsset?.label ||
    AppConfig.use(window.assetCategory).assetType.label;

  React.useEffect(() => {
    const configWind = AppConfig.use('wind');
    const grandParentId = asset && asset.type === configWind.assetType.id ? asset.id : undefined;
    let type = AppConfig.use('default').assetType.id;
    if (window.assetCategory === 'wind') type = configWind.assetType.secondAsset?.id || 0;
    getAssets({ type }).then((assets) => {
      setParents(
        assets.filter((asset) => (grandParentId ? grandParentId === asset.parentId : true))
      );
    });
  }, [asset]);

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
              const type = Object.values(AppConfig.use(window.assetCategory).measurementTypes).find(
                (type) => type.id === e
              );
              if (type) {
                setTypes(type.deviceType);
                if (form.getFieldValue('device_id')) {
                  form.setFieldsValue({ device_id: undefined });
                }
              }
              setDisabled(false);
            }
          }}
          disabled={doUpdating}
        >
          {Object.values(AppConfig.use(window.assetCategory).measurementTypes).map(
            ({ id, label }) => (
              <Select.Option key={id} value={id}>
                {label}
              </Select.Option>
            )
          )}
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
        label={parentLabel}
        name='asset_id'
        rules={[
          {
            required: true,
            message: `请选择${parentLabel}`
          }
        ]}
        hidden={!doUpdating && !!parentId}
        initialValue={parentId}
      >
        <Select placeholder={`请选择${parentLabel}`}>
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
