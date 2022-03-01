import { Divider } from 'antd';
import * as React from 'react';
import DeviceSettingFormItem from '../../components/formItems/deviceSettingFormItem';
import { SETTING_GROUPS } from '../../constants/settingGroup';
import { DeviceSetting } from '../../types/device_setting';
import { DeviceType } from '../../types/device_type';
import { EmptyLayout } from '../layout';

export const DeviceSettingContent: React.FC<{
  deviceType: DeviceType;
  settings?: DeviceSetting[];
}> = ({ deviceType, settings }) => {
  if (deviceType !== DeviceType.Router && settings) {
    if (deviceType === DeviceType.BoltElongation) {
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
              return (
                <>
                  <Divider orientation='left'>
                    <span style={{fontSize:16}}>{(group && SETTING_GROUPS[group]) || group}</span>
                  </Divider>
                  {settings
                    .filter((setting) => setting.group === group)
                    .map((setting) => (
                      <DeviceSettingFormItem editable={true} value={setting} key={setting.key} />
                    ))}
                </>
              );
            })}
          </>
        );
      }
    } else {
      return (
        <>
          {settings.map((setting) => (
            <DeviceSettingFormItem editable={true} value={setting} key={setting.key} />
          ))}
        </>
      );
    }
  }
  return <EmptyLayout description={'暂无配置信息'} />;
};
