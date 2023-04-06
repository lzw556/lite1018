import { Form, FormInstance, Input, Select } from 'antd';
import React from 'react';
import { GetDevicesRequest } from '../../../apis/device';
import { Device } from '../../../types/device';
import {
  AssertAssetCategory,
  AssertOfAssetCategory,
  AssetRow,
  getAssets,
  useAppConfigContext
} from '../../asset';
import {
  MonitoringPointTypeValue,
  MONITORING_POINT,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING
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
  const {
    root,
    last: { key, label }
  } = useAssetCategoryChain();

  React.useEffect(() => {
    if (parent === undefined) {
      let paras: any = { type: key };
      const isLastAreaAsset = AssertAssetCategory(key, AssertOfAssetCategory.IS_AREA_ASSET);
      if (AssertAssetCategory(key, AssertOfAssetCategory.IS_GENERAL)) {
        paras = { type: key, parent_id: 0 };
      } else if (isLastAreaAsset) {
        paras = { type: root.key };
      }
      getAssets(paras).then((assets) => setParents(getParents(assets, undefined, isLastAreaAsset)));
    }
  }, [parent, key, root.key]);

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
      {parents?.length > 0 ? (
        <Form.Item
          label={intl.get(label)}
          name='asset_id'
          rules={[
            {
              required: true,
              message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })
            }
          ]}
        >
          <Select
            placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}
            onChange={(id, option: any) => {
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
        <Form.Item name='asset_id' hidden={true} initialValue={parent?.id}>
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
          placeholder={intl.get('PLEASE_SELECT_SOMETHING', {
            something: intl.get('OBJECT_TYPE', { object: intl.get(MONITORING_POINT) })
          })}
          onChange={(id) => handlePointTypeChange(id)}
        >
          {MONITORING_POINTS.get(config)?.map(({ id, label }) => (
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
