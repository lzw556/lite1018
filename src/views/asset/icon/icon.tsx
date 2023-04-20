import Icon from '@ant-design/icons';
import React from 'react';
import { ReactComponent as Wind } from './wind_turbine.svg';
import { ReactComponent as Corrosion } from './corrosion.svg';
import { ReactComponent as General } from './general.svg';
import '../../../components/icon.css';
import { useAppConfigContext } from '../components';

export const AssetIcon = ({ className }: { className?: string }) => {
  const config = useAppConfigContext();
  if (config === 'corrosion' || config === 'corrosionWirelessHART') {
    return (
      <Icon component={() => <Corrosion fill='#fff' className={`icon-svg ${className} focus`} />} />
    );
  } else if (config === 'windTurbine' || config === 'windTurbinePro' || config === 'hydroTurbine') {
    return <Icon component={() => <Wind fill='#fff' className={`icon-svg ${className} wind`} />} />;
  }
  return (
    <Icon component={() => <General fill='#fff' className={`icon-svg ${className} focus`} />} />
  );
};
