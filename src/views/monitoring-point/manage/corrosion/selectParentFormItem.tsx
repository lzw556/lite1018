import { Form, Select } from 'antd';
import React from 'react';
import { GetDevicesRequest } from '../../../../apis/device';
import { Device } from '../../../../types/device';
import { AssetRow, getAssets } from '../../../asset';
import {
  MONITORING_POINT_TYPE,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING,
  PLEASE_SELECT_MONITORING_POINT_TYPE
} from '../../types';
import {
  AREA_ASSET,
  AREA_ASSET_TYPE_ID,
  getAreaAssets,
  MONITORING_POINTS,
  PLEASE_SELECT_AREA_ASSET
} from '../../../asset/corrosion';

export const SelectParentFormItem = ({
  parent,
  onSelect
}: {
  parent?: AssetRow;
  onSelect: (pointType: number, devices: Device[]) => void;
}) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);

  React.useEffect(() => {
    if (parent === undefined) {
      getAssets({ type: AREA_ASSET_TYPE_ID }).then((assets) => setParents(getAreaAssets(assets)));
    }
  }, [parent]);

  const handlePointTypeChange = React.useCallback(
    (type: number) => {
      const deviceTypes = MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING.get(type);
      if (deviceTypes)
        GetDevicesRequest({ types: deviceTypes.join(',') }).then((devices) =>
          onSelect(type, devices)
        );
    },
    [onSelect]
  );

  return (
    <>
      {parents?.length > 0 ? (
        <Form.Item
          label={AREA_ASSET}
          name='asset_id'
          rules={[{ required: true, message: PLEASE_SELECT_AREA_ASSET }]}
        >
          <Select placeholder={PLEASE_SELECT_AREA_ASSET}>
            {parents.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='asset_id' hidden={true} initialValue={parent?.id}></Form.Item>
      )}
      <Form.Item
        label={MONITORING_POINT_TYPE}
        name='type'
        rules={[{ required: true, message: PLEASE_SELECT_MONITORING_POINT_TYPE }]}
      >
        <Select
          placeholder={PLEASE_SELECT_MONITORING_POINT_TYPE}
          onChange={(id) => handlePointTypeChange(id)}
        >
          {MONITORING_POINTS.map(({ id, label }) => (
            <Select.Option key={id} value={id}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
