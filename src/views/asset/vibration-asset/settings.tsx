import React from 'react';
import intl from 'react-intl-universal';
import { AssetCategoryKey } from '../types';
import { Col, Input, InputNumber, Radio, Row, Select } from 'antd';
import { FormInputItem } from '../../../components/formInputItem';

export const Settings = ({ type }: { type: number }) => {
  if (type === AssetCategoryKey.VIBRATION_MOTOR) {
    return (
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <FormInputItem label={intl.get('motor.motor_type')} name={['attributes', 'motor_type']}>
            <Select
              options={[
                {
                  label: 'AC',
                  value: 'AC'
                },
                {
                  label: 'DC',
                  value: 'DC'
                }
              ]}
            />
          </FormInputItem>
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('motor.rotation_speed')}
            name={['attributes', 'rotation_speed']}
            numericRule={{
              message: intl.get('PLEASE_ENTER_NUMERIC')
            }}
            numericChildren={
              <InputNumber style={{ width: '100%' }} controls={false} addonAfter='RPM' />
            }
          />
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('motor.variable_frequency_drive')}
            name={['attributes', 'variable_frequency_drive']}
          >
            <Radio.Group
              options={[
                { label: '是', value: true },
                { label: '否', value: false }
              ]}
            />
          </FormInputItem>
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('motor.nominal_power')}
            name={['attributes', 'nominal_power']}
            numericRule={{
              message: intl.get('PLEASE_ENTER_NUMERIC')
            }}
            numericChildren={
              <InputNumber style={{ width: '100%' }} controls={false} addonAfter='kW' />
            }
          />
        </Col>
        <Col span={12}>
          <FormInputItem label={intl.get('motor.mounting')} name={['attributes', 'mounting']}>
            <Select
              options={[
                {
                  label: '水平',
                  value: 1
                },
                {
                  label: '垂直',
                  value: 2
                }
              ]}
            />
          </FormInputItem>
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('motor.bearing_type')}
            name={['attributes', 'bearing_type']}
          >
            <Select
              options={[
                {
                  label: '滚动轴承',
                  value: 1
                },
                {
                  label: '滑动轴承',
                  value: 2
                }
              ]}
            />
          </FormInputItem>
        </Col>
        <Col span={12}>
          <FormInputItem
            label={intl.get('motor.bearing_model')}
            name={['attributes', 'bearing_model']}
          >
            <Input />
          </FormInputItem>
        </Col>
      </Row>
    );
  } else {
    return null;
  }
};

const motorDefaultSettings = {
  attributes: {
    motor_type: 'AC',
    rotation_speed: 1000,
    variable_frequency_drive: true,
    nominal_power: 380,
    mounting: 1,
    bearing_type: 1,
    bearing_model: ''
  }
};

export function getDefaultSettings(type: number) {
  switch (type) {
    case AssetCategoryKey.VIBRATION_MOTOR:
      return motorDefaultSettings;
    default:
      break;
  }
}
