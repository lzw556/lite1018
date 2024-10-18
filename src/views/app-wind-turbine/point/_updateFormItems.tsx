import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import DeviceSelect from '../../../components/select/deviceSelect';
import { DeviceType } from '../../../types/device_type';
import { MONITORING_POINT, MonitoringPointRow, Point } from '../../asset-common';
import * as Tower from './tower';
import { getRelatedDeviceTypes, useParents } from './common';

export const UpdateFormItems = (monitoringPoint: MonitoringPointRow) => {
  const { type } = monitoringPoint;
  const parents = useParents();
  const types = [{ id: type, label: Point.getTypeLabel(type) as string }];
  const deviceTypes = getRelatedDeviceTypes(type);
  const deviceTypeId =
    monitoringPoint?.bindingDevices && monitoringPoint?.bindingDevices.length > 0
      ? monitoringPoint?.bindingDevices[0].typeId
      : 0;
  const [channels, setChannels] = React.useState<{ label: string; value: number }[]>(
    DeviceType.isMultiChannel(deviceTypeId, true)
  );

  return (
    <>
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
          {types.map(({ id, label }) => (
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
            types: deviceTypes?.join(',')
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
        label={intl.get('ASSET')}
        name='asset_id'
        rules={[
          {
            required: true,
            message: intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('ASSET') })
          }
        ]}
      >
        <Select placeholder={intl.get('PLEASE_SELECT_SOMETHING', { something: intl.get('ASSET') })}>
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
      <Tower.Index mode='update' type={type} />
    </>
  );
};
