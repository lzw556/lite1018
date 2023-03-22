import { Form, Input, InputNumber, Select } from 'antd';
import * as React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { AssetRow } from '../assetList/props';
import { getAssets } from '../assetList/services';
import * as AppConfig from '../../../config';
import { DeviceType } from '../../../types/device_type';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';

export const EditContent: React.FC<{
  form: any;
  asset?: AssetRow;
  doUpdating?: boolean;
  initialDeviceType?: number;
}> = ({ asset, form, doUpdating, initialDeviceType }) => {
  const [types, setTypes] = React.useState([initialDeviceType]);
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [disabled, setDisabled] = React.useState(true);
  const measurementTypes = AppConfig.getMeasurementTypes(window.assetCategory);
  const configWind = AppConfig.use('wind');
  const parentId = asset && asset.type !== configWind.assetType.id ? asset.id : undefined;
  const parentLabel = intl.get(
    AppConfig.use(window.assetCategory).assetType.secondAsset?.label ||
      AppConfig.use(window.assetCategory).assetType.label
  );
  const [deviceTypeId, setDeviceTypeId] = React.useState<number | undefined>(initialDeviceType);

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
      <FormInputItem
        label={intl.get('NAME')}
        name='name'
        requiredMessage={intl.get('PLEASE_INPUT_MONITORING_POINT_NAME')}
        lengthLimit={{ min: 4, max: 50, label: intl.get('NAME') }}
      >
        <Input placeholder={intl.get('PLEASE_INPUT_MONITORING_POINT_NAME')} />
      </FormInputItem>
      <Form.Item
        label={intl.get('TYPE')}
        name='type'
        rules={[{ required: true, message: intl.get('PLEASE_SELECT_TYPE') }]}
      >
        <Select
          placeholder={intl.get('PLEASE_SELECT_TYPE')}
          onChange={(e) => {
            if (!doUpdating) {
              const type = measurementTypes.find((type) => type.id === e);
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
          {measurementTypes
            .filter((type) => !type.hidden)
            .map(({ id, label }) => (
              <Select.Option key={id} value={id}>
                {intl.get(label)}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={intl.get('SENSOR')}
        name='device_id'
        rules={[{ required: true, message: intl.get('PLEASE_SELECT_SENSOR') }]}
      >
        <DeviceSelect
          filters={{ types: types.join(',') }}
          disabled={disabled && !doUpdating}
          onTypeChange={(type) => setDeviceTypeId(type)}
        />
      </Form.Item>
      {deviceTypeId === DeviceType.BoltElongationMultiChannels && (
        <Form.Item
          label={intl.get('CHANNEL')}
          name='channel'
          rules={[{ required: true, message: intl.get('PLEASE_SELECT_CHANNEL') }]}
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
        label={parentLabel}
        name='asset_id'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: parentLabel })
          }
        ]}
        hidden={!doUpdating && !!parentId}
        initialValue={parentId}
      >
        <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: parentLabel })}>
          {parents.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <FormInputItem
        label={intl.get('POSITION')}
        name={['attributes', 'index']}
        initialValue={1}
        requiredMessage={intl.get('PLEASE_INPUT_MONITORING_POINT_POSITION')}
        numericRule={{
          isInteger: true,
          min: 1,
          message: intl.get('UNSIGNED_INTEGER_INPUT_PROMPT')
        }}
        numericChildren={
          <InputNumber
            placeholder={intl.get('PLEASE_INPUT_MONITORING_POINT_POSITION')}
            controls={false}
            style={{ width: '100%' }}
          />
        }
      >
        {window.assetCategory === 'wind' ? (
          <InputNumber
            placeholder={intl.get('PLEASE_INPUT_POSITION')}
            controls={false}
            style={{ width: '100%' }}
          />
        ) : (
          <Select placeholder={intl.get('PLEASE_SELECT_INDEX')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        )}
      </FormInputItem>
    </>
  );
};
