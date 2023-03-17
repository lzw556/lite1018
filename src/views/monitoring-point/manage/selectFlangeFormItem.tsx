import { Form, FormInstance, Select } from 'antd';
import React from 'react';
import { GetDevicesRequest } from '../../../apis/device';
import { MONITORING_POINTS } from '../../../config/assetCategory.config';
import { Device } from '../../../types/device';
import { useAssetCategoryContext } from '../../asset/components/assetCategoryContext';
import { AssetRow } from '../../asset';
import {
  MonitoringPointTypeValue,
  MONITORING_POINT_TYPE,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING,
  PLEASE_SELECT_MONITORING_POINT_TYPE
} from '../types';
import { MonitoringPointBatch } from './create';
import { checkIsFlangePreload, FLANGE, PLEASE_SELECT_FLANGE } from '../../flange';

export const SelectFlangeFormItem = ({
  flanges = [],
  flange,
  onSelect,
  form
}: {
  flanges?: AssetRow[];
  flange?: AssetRow;
  onSelect: (pointType: number, devices: Device[]) => void;
  form: FormInstance<MonitoringPointBatch>;
}) => {
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(flange));
  const category = useAssetCategoryContext();

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

  React.useEffect(() => {
    if (isFlangePreload) {
      handlePointTypeChange(MonitoringPointTypeValue.PRELOAD);
      form.setFieldValue('type', MonitoringPointTypeValue.PRELOAD);
    }
  }, [form, handlePointTypeChange, isFlangePreload]);

  return (
    <>
      {flanges?.length > 0 ? (
        <Form.Item
          label={FLANGE}
          name='asset_id'
          rules={[{ required: true, message: PLEASE_SELECT_FLANGE }]}
        >
          <Select
            placeholder={PLEASE_SELECT_FLANGE}
            onChange={(id, option: any) => {
              setIsFlangePreload(checkIsFlangePreload(option));
            }}
          >
            {flanges.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='asset_id' hidden={true} initialValue={flange?.id}></Form.Item>
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
          {MONITORING_POINTS.get(category)?.map(({ id, label }) => (
            <Select.Option
              key={id}
              value={id}
              disabled={id === MonitoringPointTypeValue.LOOSENING_ANGLE && isFlangePreload}
            >
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
