import * as React from 'react';
import { Radio } from 'antd';
import intl from 'react-intl-universal';
import { MonitoringPointRow } from '../../../../asset-common';
import { AlarmRuleSetting } from './alarm';
import { Basic } from './basic';

export const Settings = ({
  point,
  onUpdateSuccess
}: {
  point: MonitoringPointRow;
  onUpdateSuccess: () => void;
}) => {
  const [type, setType] = React.useState('basic');

  return (
    <>
      <Radio.Group
        style={{ marginBottom: 16 }}
        options={[
          { label: intl.get('BASIC_INFORMATION'), value: 'basic' },
          { label: intl.get('ALARM_RULES'), value: 'alarm' }
        ]}
        onChange={(e) => setType(e.target.value)}
        value={type}
        optionType='button'
        buttonStyle='solid'
      />
      {type === 'basic' && <Basic monitoringPoint={point} onSuccess={onUpdateSuccess} />}
      {type === 'alarm' && <AlarmRuleSetting {...point} />}
    </>
  );
};
