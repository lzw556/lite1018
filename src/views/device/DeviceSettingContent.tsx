import * as React from 'react';
import DeviceSettingFormItem from '../../components/formItems/deviceSettingFormItem';
import { SETTING_GROUPS } from '../../constants/settingGroup';
import { DeviceSetting } from '../../types/device_setting';
import { DeviceType } from '../../types/device_type';
import intl from 'react-intl-universal';
import { SVTSettings } from './svtSettings';

export const DeviceSettingContent: React.FC<{
  deviceType: DeviceType;
  settings?: DeviceSetting[];
}> = ({ deviceType, settings }) => {
  if (settings) {
    if (DeviceType.hasGroupedSettings(deviceType)) {
      let groups: DeviceSetting['group'][] = [];
      settings.forEach((setting) => {
        if (
          setting.group &&
          (groups.length === 0 || !groups.find((group) => group === setting.group))
        ) {
          groups.push(setting.group);
        }
      });
      if (groups.length > 0) {
        return (
          <>
            {groups.map((group) => {
              let groupName = '';
              if (group) {
                const label = SETTING_GROUPS[group];
                if (label) {
                  groupName = intl.get(label);
                } else if (group.indexOf('channel') > -1) {
                  groupName = intl.get('SETTING_GROUP_CHANNEL', {
                    channel: group.replace('channel', '')
                  });
                }
              }
              return (
                <fieldset key={group}>
                  <legend>{groupName}</legend>
                  {settings
                    .filter((setting) => setting.group === group)
                    .sort((prev, next) => prev.sort - next.sort)
                    .map((setting) => (
                      <DeviceSettingFormItem editable={true} value={setting} key={setting.key} />
                    ))}
                </fieldset>
              );
            })}
          </>
        );
      }
    } else {
      return (
        <>
          {DeviceType.isVibration(deviceType) && !DeviceType.isWiredDevice(deviceType)
            ? settings &&
              settings.length > 0 && (
                <SVTSettings settings={settings} key={deviceType} type={deviceType} />
              )
            : settings
                .sort((prev, next) => prev.sort - next.sort)
                .map((setting) => (
                  <DeviceSettingFormItem editable={true} value={setting} key={setting.key} />
                ))}
        </>
      );
    }
  }
  return null;
};
