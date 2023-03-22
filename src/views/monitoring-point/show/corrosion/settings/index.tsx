import { Radio } from 'antd';
import * as React from 'react';
import { MonitoringPointRow } from '../../../types';
import { AlarmRuleSetting } from '../../alarm';
import { BasicSetting } from './basic';
import intl from 'react-intl-universal';

export const MonitoringPointSet = ({
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
      {type === 'basic' && (
        <BasicSetting monitoringPoint={point} onUpdateSuccess={onUpdateSuccess} />
      )}
      {type === 'alarm' && <AlarmRuleSetting {...point} />}
    </>
  );
};
