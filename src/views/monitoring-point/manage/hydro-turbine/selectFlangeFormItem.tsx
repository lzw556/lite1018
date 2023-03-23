import { Form, FormInstance, Select } from 'antd';
import React from 'react';
import { GetDevicesRequest } from '../../../../apis/device';
import { Device } from '../../../../types/device';
import { AssetRow, getAssets } from '../../../asset';
import {
  MonitoringPointTypeValue,
  MONITORING_POINT_TYPE,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING,
  PLEASE_SELECT_MONITORING_POINT_TYPE
} from '../../types';
import { HydroMonitoringPointBatch } from './create';
import { checkIsFlangePreload, FLANGE, getFlanges, PLEASE_SELECT_FLANGE } from '../../../flange';
import { MONITORING_POINTS, HYDRO_TURBINE_ASSET_TYPE_ID } from '../../../asset/hydro-turbine';
import intl from 'react-intl-universal';

export const SelectFlangeFormItem = ({
  flange,
  onSelect,
  form
}: {
  flange?: AssetRow;
  onSelect: (pointType: number, devices: Device[]) => void;
  form: FormInstance<HydroMonitoringPointBatch>;
}) => {
  const [flanges, setFlanges] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(flange));

  React.useEffect(() => {
    if (flange === undefined) {
      getAssets({ type: HYDRO_TURBINE_ASSET_TYPE_ID }).then((assets) =>
        setFlanges(getFlanges(assets))
      );
    }
  }, [flange]);

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
          label={intl.get(FLANGE)}
          name='asset_id'
          rules={[{ required: true, message: intl.get(PLEASE_SELECT_FLANGE) }]}
        >
          <Select
            placeholder={intl.get(PLEASE_SELECT_FLANGE)}
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
        label={intl.get(MONITORING_POINT_TYPE)}
        name='type'
        rules={[{ required: true, message: intl.get(PLEASE_SELECT_MONITORING_POINT_TYPE) }]}
      >
        <Select
          placeholder={intl.get(PLEASE_SELECT_MONITORING_POINT_TYPE)}
          onChange={(id) => handlePointTypeChange(id)}
        >
          {MONITORING_POINTS.map(({ id, label }) => (
            <Select.Option
              key={id}
              value={id}
              disabled={id === MonitoringPointTypeValue.LOOSENING_ANGLE && isFlangePreload}
            >
              {intl.get(label)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
