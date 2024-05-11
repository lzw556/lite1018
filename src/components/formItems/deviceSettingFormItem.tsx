import { Checkbox, Form, Input, InputNumber, Radio, Select } from 'antd';
import { DeviceSetting, DeviceSettingValueType } from '../../types/device_setting';
import { FC, useState } from 'react';
import { Rules } from '../../constants/validator';
import intl from 'react-intl-universal';
import { Term } from '../term';

export interface DeviceSettingFormItemProps {
  value: DeviceSetting;
  editable: boolean;
}

const { Option } = Select;

const DeviceSettingFormItem: FC<DeviceSettingFormItemProps> = ({ value, editable }) => {
  const [setting, setSetting] = useState<DeviceSetting>(transformValue(value));

  const renderComponents = () => {
    switch (setting.type) {
      case DeviceSettingValueType.bool:
        return (
          <Radio.Group
            disabled={!editable}
            buttonStyle={'solid'}
            onChange={(e) => {
              setSetting({ ...setting, value: e.target.value });
            }}
          >
            <Radio.Button key={'true'} value={true}>
              {intl.get('ENABLED')}
            </Radio.Button>
            <Radio.Button key={'false'} value={false}>
              {intl.get('DISABLED')}
            </Radio.Button>
          </Radio.Group>
        );
    }
    if (setting.options) {
      if (setting.optionType === 'checkbox') {
        return (
          <Checkbox.Group
            options={Object.keys(setting.options).map((value) => ({
              label: intl.get(setting.options[value]),
              value: Number(value)
            }))}
            onChange={(value) => setSetting({ ...setting, value })}
          />
        );
      }
      return (
        <Select onChange={(value) => setSetting({ ...setting, value: value })} disabled={!editable}>
          {Object.keys(setting.options).map((key) => {
            return (
              <Option key={key} value={Number(key)}>
                {intl.get(setting.options[key]).d(setting.options[key])}
              </Option>
            );
          })}
        </Select>
      );
    }
    if (setting.type === DeviceSettingValueType.string) {
      return (
        <Input
          suffix={setting.unit ? intl.get(setting.unit).d(setting.unit) : ''}
          disabled={!editable}
        />
      );
    } else {
      return (
        <InputNumber
          disabled={!editable}
          controls={false}
          style={{ width: '100%' }}
          addonAfter={setting.unit ? intl.get(setting.unit).d(setting.unit) : ''}
        />
      );
    }
  };

  const renderChildren = () => {
    return (
      setting.children &&
      setting.children
        .sort((prev, next) => prev.sort - next.sort)
        .map((child) => {
          if (setting.value === child.show) {
            return <DeviceSettingFormItem editable={editable} value={child} key={child.key} />;
          } else if (
            setting.options &&
            Array.isArray(setting.value) &&
            setting.value.includes(child.show)
          ) {
            return <DeviceSettingFormItem editable={editable} value={child} key={child.key} />;
          }
          return null;
        })
    );
  };

  const renderRules = (setting: DeviceSetting) => {
    switch (setting.type) {
      case DeviceSettingValueType.uint8:
      case DeviceSettingValueType.uint16:
      case DeviceSettingValueType.uint32:
      case DeviceSettingValueType.float:
        const ruleRequired = {
          required: true,
          message: intl.get('PLEASE_ENTER_SOMETHING', {
            something: intl.get(setting.name).toLowerCase()
          })
        };
        const ruleNumeric = {
          type: 'number',
          transform(value: number) {
            if (value) {
              return Number(value);
            }
            return value;
          },
          message: intl.get('PLEASE_ENTER_NUMERIC')
        };
        if (setting.validator) {
          return [ruleRequired, ruleNumeric];
        }
        return [Rules.number()];
      case DeviceSettingValueType.uint64:
        if (setting.optionType === 'checkbox') {
          return [{ type: 'array', min: 1 }];
        } else {
          if (setting.validator) {
            return [{ ...Rules.number(), ...setting.validator }];
          }
          return [Rules.number()];
        }
      default:
        if (setting.validator) {
          return [setting.validator];
        }
        return [];
    }
  };

  function transformValue(setting: any) {
    if (setting.options && setting.optionType === 'checkbox') {
      return {
        ...setting,
        value: valueToArray(
          Object.keys(setting.options).map((value) => Number(value)),
          setting.value
        )
      };
    }
    return setting;
  }

  function valueToArray(optionArray: number[], value: number) {
    var ret = [];
    for (let i = 0; i < optionArray.length; i++) {
      if ((value & optionArray[i]) > 0) {
        ret.push(optionArray[i]);
      }
    }
    return ret;
  }

  return (
    <>
      <Form.Item
        label={
          <Term name={intl.get(setting.name)} description={intl.get(`${setting.name}_DESC`)} />
        }
        name={[setting.category, setting.key]}
        initialValue={setting.value}
        rules={renderRules(setting)}
      >
        {renderComponents()}
      </Form.Item>
      {renderChildren()}
    </>
  );
};
export default DeviceSettingFormItem;

export function processArrayValuesInSensorSetting(setting: any) {
  const newSetting = { ...setting };
  for (const key in newSetting) {
    if (Object.prototype.hasOwnProperty.call(newSetting, key)) {
      const value = newSetting[key];
      if (Array.isArray(value)) {
        newSetting[key] = convertArrayValue2Single(value);
      }
    }
  }
  return newSetting;
}

function convertArrayValue2Single(value: number[]) {
  return value.reduce((prev, crt) => prev | crt);
}
