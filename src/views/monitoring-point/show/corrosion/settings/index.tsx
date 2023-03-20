import { Radio } from 'antd';
import * as React from 'react';
import { MonitoringPointRow } from '../../../types';
import { AlarmRuleSetting } from '../../alarm';
import { BasicSetting } from './basic';

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
          { label: '基础信息', value: 'basic' },
          { label: '报警规则', value: 'alarm' }
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
