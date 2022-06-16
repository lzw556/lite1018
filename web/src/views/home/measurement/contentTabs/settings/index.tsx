import { Radio } from 'antd';
import * as React from 'react';
import { MeasurementRow } from '../../props';
import { AlarmRuleSetting } from './AlarmRuleSetting';
import { BasicSetting } from './BasicSetting';

export const MeasurementSettings: React.FC<MeasurementRow & { onUpdate?: () => void }> = (props) => {
  const [type, setType] = React.useState('basic');
  return (
    <>
      <Radio.Group
        style={{ marginBottom: 12 }}
        options={[
          { label: '基础信息', value: 'basic' },
          { label: '报警规则', value: 'alarm' }
        ]}
        onChange={(e) => setType(e.target.value)}
        value={type}
        optionType='button'
        buttonStyle='solid'
      />
      {type === 'basic' && <BasicSetting {...props} />}
      {type === 'alarm' && <AlarmRuleSetting  {...props}/>}
    </>
  );
};
