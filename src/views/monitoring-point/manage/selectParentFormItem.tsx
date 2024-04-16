import { Form, FormInstance, Input, Select } from 'antd';
import React from 'react';
import { GetDevicesRequest } from '../../../apis/device';
import { Device } from '../../../types/device';
import { AssetRow, getAssets, useAppConfigContext } from '../../asset';
import {
  MonitoringPointTypeValue,
  MONITORING_POINT,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING,
  MONITORING_POINT_TYPE_VALUE_ASSET_CATEGORY_KEY_MAPPING
} from '../types';
import { MonitoringPointBatch } from './create';
import { checkIsFlangePreload } from '../../flange';
import intl from 'react-intl-universal';
import { MONITORING_POINTS, useAssetCategoryChain } from '../../../config/assetCategory.config';
import { getParents } from '../../asset/common/utils';

export const SelectParentFormItem = ({
  parent,
  onSelect,
  form
}: {
  parent?: AssetRow;
  onSelect: (pointType: number, devices: Device[]) => void;
  form: FormInstance<MonitoringPointBatch>;
}) => {
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const [isFlangePreload, setIsFlangePreload] = React.useState(checkIsFlangePreload(parent));
  const config = useAppConfigContext();
  const { root, last } = useAssetCategoryChain();
  const memoedLast = React.useRef(last);
  const [selectedParent, setSelectedParent] = React.useState<AssetRow | undefined>(parent);
  const [monitoringPointTypes, setMonitoringPointTypes] = React.useState<
    MonitoringPointTypeValue[]
  >([]);

  React.useEffect(() => {
    if (parent === undefined) {
      getAssets({ type: root.key, parent_id: 0 }).then((assets) => {
        setParents(getParents(assets, memoedLast.current));
      });
    } else {
      form.setFieldValue('asset_id', parent.id);
    }
  }, [parent, root.key, form]);

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

  React.useEffect(() => {
    if (selectedParent) {
      const types =
        MONITORING_POINT_TYPE_VALUE_ASSET_CATEGORY_KEY_MAPPING.get(selectedParent.type) ?? [];
      setMonitoringPointTypes(types);
      const selectedType = form.getFieldValue('type');
      if (!types.includes(selectedType)) {
        form.setFieldValue('type', undefined);
      }
    }
  }, [selectedParent, form]);

  return (
    <>
      {parents?.length > 0 ? (
        <Form.Item
          label={intl.get('ASSET')}
          name='asset_id'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('ASSET') })
            }
          ]}
        >
          <Select
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('ASSET') })}
            onChange={(id, option: any) => {
              setSelectedParent(parents.find((a) => a.id === id));
              setIsFlangePreload(checkIsFlangePreload(option));
            }}
          >
            {parents.map(({ id, name, attributes }) => (
              <Select.Option key={id} value={id} attributes={attributes}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <Form.Item name='asset_id' hidden={true}>
          <Input />
        </Form.Item>
      )}
      <Form.Item
        label={intl.get('TYPE')}
        name='type'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', {
              something: intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) })
            })
          }
        ]}
      >
        <Select
          disabled={!selectedParent}
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
            something: intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) })
          })}
          onChange={(id) => handlePointTypeChange(id)}
        >
          {MONITORING_POINTS.get(config)
            ?.filter((t) =>
              monitoringPointTypes.length > 0 ? monitoringPointTypes?.includes(t.id) : true
            )
            .map(({ id, label }) => (
              <Select.Option
                key={id}
                value={id}
                disabled={
                  (id === MonitoringPointTypeValue.LOOSENING_ANGLE ||
                    id === MonitoringPointTypeValue.TOWER_INCLINATION ||
                    id === MonitoringPointTypeValue.TOWER_BASE_SETTLEMENT) &&
                  isFlangePreload
                }
              >
                {intl.get(label)}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>
    </>
  );
};
