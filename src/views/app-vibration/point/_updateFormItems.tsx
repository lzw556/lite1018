import React from 'react';
import { Form, Input, Select } from 'antd';
import intl from 'react-intl-universal';
import { FormInputItem } from '../../../components/formInputItem';
import DeviceSelect from '../../../components/select/deviceSelect';
import { Asset, MONITORING_POINT, MonitoringPointRow, Point } from '../../asset-common';
import { useMonitoringPointParents } from '../../asset-variant';
import { relatedDeviceTypes } from './common';
import { Others } from './others';

export const UpdateFormItems = (monitoringPoint: MonitoringPointRow) => {
  const { type } = monitoringPoint;
  const parents = useMonitoringPointParents((asset) => Asset.Assert.isVibrationRelated(asset.type));
  const types = [{ id: type, label: Point.getTypeLabel(type) as string }];
  const deviceTypes = relatedDeviceTypes.get(type);

  return (
    <>
      <fieldset>
        <legend>{intl.get('BASIC_INFORMATION')}</legend>
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
          />
        </Form.Item>
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
          >
            {parents.map(({ id, name }) => (
              <Select.Option key={id} value={id}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </fieldset>
      <fieldset>
        <legend>{intl.get('monitoring.point.attr')}</legend>
        <Others mode='update' />
      </fieldset>
    </>
  );
};
