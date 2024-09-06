import React from 'react';
import { Form, Input, InputNumber, Radio, Select } from 'antd';
import intl from 'react-intl-universal';
import { DeviceSetting, DeviceSettingValueType } from '../../types/device_setting';
import { DeviceType } from '../../types/device_type';

export const SVTSettings = ({
  settings,
  type
}: {
  settings?: DeviceSetting[];
  type: DeviceType;
}) => {
  const mounting_type = settings?.find((s) => s.key === 'mounting_type');
  const disp_mode = settings?.find((s) => s.key === 'disp_mode');
  const base_frequency = settings?.find((s) => s.key === 'base_frequency');
  const communication_period = DeviceType.isSVTLora(type)
    ? settings?.find((s) => s.key === 'communication_period')
    : null;
  const sample_period = settings?.find((s) => s.key === 'sample_period');
  const sample_offset = settings?.find((s) => s.key === 'sample_offset');
  const { mode, action, fields } = useAcquisitionModeRelatedFields(settings);
  const settingsFields = [...fields, mounting_type, disp_mode, base_frequency];
  if (communication_period) {
    settingsFields.push(communication_period);
  }
  const commonSampleRelatedFields = [sample_period, sample_offset];
  const sampleRelatedFields: any = useSampleRelatedFields(type, settings);
  const waveRelatedFields = useWaveRealtedFields(mode, action, settings);
  if (mode === 0 || action === 1) {
    settingsFields.push(...commonSampleRelatedFields, ...sampleRelatedFields, ...waveRelatedFields);
  } else if (action === 2) {
    settingsFields.push(...sampleRelatedFields);
  } else if (action === 4) {
    settingsFields.push(...waveRelatedFields);
  }

  if (!settings || settings.length === 0) return null;

  return (
    <>
      {settingsFields.map((s: any) => (
        <InternalFormItem setting={s} onChange={s?.onChange} />
      ))}
    </>
  );
};

function useAcquisitionModeRelatedFields(settings?: DeviceSetting[]) {
  const acquisition_mode = settings?.find((s) => s.key === 'acquisition_mode');
  const trigger_action = settings?.find((s) => s.key === 'trigger_action');
  const on_threshold = settings?.find((s) => s.key === 'on_threshold');
  const off_threshold = settings?.find((s) => s.key === 'off_threshold');
  const trigger_period = settings?.find((s) => s.key === 'trigger_period');
  const trigger_delay = settings?.find((s) => s.key === 'trigger_delay');
  const [mode, setMode] = React.useState(acquisition_mode ? acquisition_mode.value : 0);
  const [action, setAction] = React.useState(trigger_action ? trigger_action.value : 1);

  const actionField = { ...trigger_action, onChange: setAction };
  if (!settings || settings.length === 0) return { mode, action, fields: [] };
  return {
    mode,
    action,
    fields: [
      { ...acquisition_mode, onChange: setMode },
      ...(mode === 0
        ? []
        : action === 1
        ? [actionField, on_threshold, off_threshold, trigger_period, trigger_delay]
        : [actionField, on_threshold, trigger_period, trigger_delay])
    ]
  };
}

function useSampleRelatedFields(type: DeviceType, settings?: DeviceSetting[]) {
  const acc3_is_auto = settings?.find((s) => s.key === 'acc3_is_auto');
  const acc3_range = acc3_is_auto?.children?.find((s) => s.key === 'acc3_range');
  const den_is_enabled = settings?.find((s) => s.key === 'den_is_enabled');
  const acc3_odr = settings?.find((s) => s.key === 'acc3_odr');
  const acc3_samples = settings?.find((s) => s.key === 'acc3_samples');
  const acc1_odr = settings?.find((s) => s.key === 'acc1_odr');
  const acc1_samples = settings?.find((s) => s.key === 'acc1_samples');
  const [isAuto, setIsAuto] = React.useState<boolean>(acc3_is_auto ? acc3_is_auto.value : false);
  const fields: any = [{ ...acc3_is_auto, onChange: setIsAuto }];
  if (!isAuto) {
    fields.push(acc3_range);
  }
  if (type === DeviceType.SVT210R) {
    fields.push(den_is_enabled);
  }
  fields.push(acc3_odr, acc3_samples);
  if (type === DeviceType.SVT220520) {
    fields.push(acc1_odr, acc1_samples);
  }
  if (!settings || settings.length === 0) return [];
  return fields;
}

function useWaveRealtedFields(mode: number, triggerAction: number, settings?: DeviceSetting[]) {
  const is_enabled_2 = settings?.find((s) => s.key === 'is_enabled_2');
  const isWaveformOnce = mode === 1 && triggerAction === 4;
  const [enabled, setEnabled] = React.useState(is_enabled_2 ? is_enabled_2.value : false);
  const enabledField = { ...is_enabled_2, onChange: setEnabled };
  const waveFields = [];
  if (is_enabled_2 && is_enabled_2.children && is_enabled_2.children.length > 0) {
    waveFields.push(...is_enabled_2.children);
  }
  if (!settings || settings.length === 0) return [];
  if (isWaveformOnce) {
    return waveFields.filter((s) => s.key !== 'sample_period_2' && s.key !== 'sample_offset_2');
  } else {
    return enabled ? [enabledField, ...waveFields] : [enabledField];
  }
}

const InternalFormItem = ({
  onChange,
  setting
}: {
  onChange?: (value: any) => void;
  setting?: DeviceSetting;
}) => {
  if (!setting) {
    return null;
  }
  let control;
  const unit = setting.unit ? intl.get(setting.unit).d(setting.unit) : '';
  if (setting.type === DeviceSettingValueType.bool) {
    control = (
      <Radio.Group buttonStyle={'solid'} onChange={(e) => onChange?.(e.target.value)}>
        <Radio.Button key={'true'} value={true}>
          {intl.get('ENABLED')}
        </Radio.Button>
        <Radio.Button key={'false'} value={false}>
          {intl.get('DISABLED')}
        </Radio.Button>
      </Radio.Group>
    );
  } else if (setting.options) {
    control = (
      <Select onChange={onChange}>
        {Object.keys(setting.options).map((key) => {
          return (
            <Select.Option key={key} value={Number(key)}>
              {intl.get(setting.options[key]).d(setting.options[key])}
            </Select.Option>
          );
        })}
      </Select>
    );
  } else if (setting.type === DeviceSettingValueType.string) {
    control = <Input suffix={unit} />;
  } else {
    control = <InputNumber controls={false} style={{ width: '100%' }} addonAfter={unit} />;
  }
  return (
    <Form.Item
      name={[setting.category, setting.key]}
      label={intl.get(setting.name)}
      initialValue={setting.value}
    >
      {control}
    </Form.Item>
  );
};
