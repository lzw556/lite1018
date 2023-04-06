import { Form, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import React from 'react';
import DeviceSelect from '../../../components/select/deviceSelect';
import { DeviceType } from '../../../types/device_type';
import {
  AssertAssetCategory,
  AssertOfAssetCategory,
  AssetRow,
  getAssets,
  useAppConfigContext
} from '../../asset';
import {
  MonitoringPoint,
  MonitoringPointRow,
  MONITORING_POINT,
  MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING
} from '../types';
import { convertRow } from '../utils';
import intl from 'react-intl-universal';
import { MONITORING_POINTS, useAssetCategoryChain } from '../../../config/assetCategory.config';
import { getParents } from '../../asset/common/utils';
import { FormInputItem } from '../../../components/formInputItem';

export const UpdateForm = ({
  monitoringPoint,
  form,
  children,
  style
}: {
  monitoringPoint: MonitoringPointRow;
  form: FormInstance<MonitoringPoint & { device_id: number }>;
  children?: JSX.Element;
  style?: React.CSSProperties;
}) => {
  const config = useAppConfigContext();
  const {
    root,
    last: { label, key }
  } = useAssetCategoryChain();
  const [parents, setParents] = React.useState<AssetRow[]>([]);
  const deviceTypeId =
    monitoringPoint?.bindingDevices && monitoringPoint?.bindingDevices.length > 0
      ? monitoringPoint?.bindingDevices[0].typeId
      : 0;
  const [channels, setChannels] = React.useState<{ label: string; value: number }[]>(
    DeviceType.isMultiChannel(deviceTypeId, true)
  );

  React.useEffect(() => {
    let paras: any = { type: key };
    const isLastAreaAsset = AssertAssetCategory(key, AssertOfAssetCategory.IS_AREA_ASSET);
    if (AssertAssetCategory(key, AssertOfAssetCategory.IS_GENERAL)) {
      paras = { type: key, parent_id: 0 };
    } else if (isLastAreaAsset) {
      paras = { type: root.key };
    }
    getAssets(paras).then((assets) => setParents(getParents(assets, undefined, isLastAreaAsset)));
  }, [key, root.key]);

  React.useEffect(() => {
    if (monitoringPoint) {
      form.resetFields();
      const values = convertRow(monitoringPoint);
      if (values) form.setFieldsValue(values);
    }
  }, [monitoringPoint, form]);

  return (
    <Form form={form} labelCol={{ span: 4 }} style={style}>
      <FormInputItem
        label={intl.get('NAME')}
        name='name'
        requiredMessage={intl.get('PLEASE_ENTER_NAME')}
        lengthLimit={{ min: 4, max: 50, label: intl.get('NAME').toLowerCase() }}
      >
        <Input placeholder={intl.get('PLEASE_ENTER_NAME')} />
      </FormInputItem>
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
          disabled={true}
        >
          {MONITORING_POINTS.get(config)?.map(({ id, label }) => (
            <Select.Option key={id} value={id}>
              {intl.get(label)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={intl.get('SENSOR')}
        name='device_id'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('SENSOR') })
          }
        ]}
      >
        <DeviceSelect
          filters={{
            types: MONITORING_POINT_TYPE_VALUE_DEVICE_TYPE_ID_MAPPING.get(
              monitoringPoint.type
            )?.join(',')
          }}
          onTypeChange={(type) => setChannels(DeviceType.isMultiChannel(type ?? 0, true))}
        />
      </Form.Item>
      {channels.length > 0 && (
        <Form.Item
          label={intl.get('CHANNEL')}
          name='channel'
          rules={[{ required: true, message: intl.get('PLEASE_SELECT_CHANNEL') }]}
          initialValue={1}
        >
          <Select>
            {channels.map(({ label, value }) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
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
        <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get(label) })}>
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
        requiredMessage={intl.get('PLEASE_ENTER_SOMETHING', {
          something: intl.get('POSITION')
        })}
        numericRule={{
          isInteger: true,
          min: 1,
          message: intl.get('UNSIGNED_INTEGER_ENTER_PROMPT')
        }}
        placeholder={intl.get('PLEASE_ENTER_SOMETHING', {
          something: intl.get('POSITION')
        })}
      />
      {children}
    </Form>
  );
};
